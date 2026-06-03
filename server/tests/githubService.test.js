import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchAllUserRepos, streamRepoBatchesFromGitHub } from '../src/services/githubService.js';
import { fetchUserRepos } from '../src/services/userService.js';
import { cache } from '../src/services/cache.js';
import { MAX_REPO_PAGES, GITHUB_FETCH_PER_PAGE } from '../src/constants/github.js';
import * as githubService from '../src/services/githubService.js';

describe('sorted repos pagination', () => {
  beforeEach(() => {
    cache.clear();
    vi.restoreAllMocks();
  });

  it('paginates globally sorted repos in chunks of 10', async () => {
    const allSorted = Array.from({ length: 45 }, (_, i) => ({
      id: i,
      name: `repo-${i}`,
      description: null,
      language: 'JS',
      stars: 45 - i,
      updatedAt: '2024-01-01',
      htmlUrl: `https://github.com/u/repo-${i}`,
      openIssuesCount: 0,
      defaultBranch: 'main',
    }));

    vi.spyOn(githubService, 'fetchAllUserRepos').mockResolvedValue(allSorted);

    const page1 = await fetchUserRepos('octocat', { page: 1, sort: 'stars', order: 'desc' });
    const page5 = await fetchUserRepos('octocat', { page: 5, sort: 'stars', order: 'desc' });

    expect(page1.repos).toHaveLength(10);
    expect(page1.repos[0].stars).toBe(45);
    expect(page1.totalPages).toBe(5);
    expect(page1.hasMore).toBe(true);

    expect(page5.repos).toHaveLength(5);
    expect(page5.repos[0].stars).toBe(5);
    expect(page5.hasMore).toBe(false);
  });

  it('sorts ascending when order is asc', async () => {
    const allSorted = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      name: `repo-${i}`,
      description: null,
      language: 'JS',
      stars: i,
      updatedAt: '2024-01-01',
      htmlUrl: `https://github.com/u/repo-${i}`,
      openIssuesCount: 0,
      defaultBranch: 'main',
    }));

    vi.spyOn(githubService, 'fetchAllUserRepos').mockResolvedValue(allSorted);

    const page1 = await fetchUserRepos('octocat', { page: 1, sort: 'stars', order: 'asc' });
    expect(page1.repos[0].stars).toBe(0);
    expect(page1.repos[9].stars).toBe(9);
  });
});

describe('streamRepoBatchesFromGitHub', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches batches of 100 from GitHub until a short page', async () => {
    const fullBatch = Array.from({ length: GITHUB_FETCH_PER_PAGE }, (_, i) => ({
      id: i,
      name: `repo-${i}`,
      description: null,
      language: null,
      stargazers_count: i,
      updated_at: '2024-01-01',
      html_url: `https://github.com/u/repo-${i}`,
      open_issues_count: 0,
      default_branch: 'main',
    }));

    const lastBatch = [
      {
        id: 100,
        name: 'repo-100',
        description: null,
        language: null,
        stargazers_count: 500,
        updated_at: '2024-01-01',
        html_url: 'https://github.com/u/repo-100',
        open_issues_count: 0,
        default_branch: 'main',
      },
    ];

    const fetchMock = vi.fn().mockImplementation((url) => {
      const page = new URL(url).searchParams.get('page');
      const payload = page === '1' ? fullBatch : page === '2' ? lastBatch : [];

      return Promise.resolve({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => payload,
      });
    });

    vi.stubGlobal('fetch', fetchMock);

    const all = await fetchAllUserRepos('octocat');

    expect(fetchMock).toHaveBeenCalledTimes(MAX_REPO_PAGES);
    expect(fetchMock.mock.calls[0][0]).toContain('per_page=100');
    expect(all).toHaveLength(101);
    expect(all[0].stars).toBe(0);
    expect(all[100].stars).toBe(500);
  });

  it('stops fetching after MAX_REPO_PAGES', async () => {
    const fullPage = Array.from({ length: GITHUB_FETCH_PER_PAGE }, (_, i) => ({
      id: i,
      name: `repo-${i}`,
      description: null,
      language: null,
      stargazers_count: i,
      updated_at: '2024-01-01',
      html_url: `https://github.com/u/repo-${i}`,
      open_issues_count: 0,
      default_branch: 'main',
    }));

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      json: async () => fullPage,
    });

    vi.stubGlobal('fetch', fetchMock);

    const batches = [];
    for await (const batch of streamRepoBatchesFromGitHub('heavy-user')) {
      batches.push(batch);
    }

    expect(fetchMock).toHaveBeenCalledTimes(MAX_REPO_PAGES);
    expect(batches.flat()).toHaveLength(MAX_REPO_PAGES * GITHUB_FETCH_PER_PAGE);
  });
});
