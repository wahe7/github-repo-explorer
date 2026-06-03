import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GitHubError } from '../src/utils/githubError.js';
import { ValidationError } from '../src/utils/validationError.js';
import * as githubService from '../src/services/githubService.js';
import {
  fetchUserProfile,
  fetchUserRepos,
  fetchRepoDetail,
} from '../src/services/userService.js';
import { cache } from '../src/services/cache.js';

describe('userService not found handling', () => {
  beforeEach(() => {
    cache.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cache.clear();
  });

  it('throws USER_NOT_FOUND when profile is missing', async () => {
    vi.spyOn(githubService, 'getUserProfile').mockResolvedValue(null);

    await expect(fetchUserProfile('ghost')).rejects.toMatchObject({
      code: 'USER_NOT_FOUND',
      status: 404,
    });
  });

  it('throws USER_NOT_FOUND when repos result is invalid', async () => {
    vi.spyOn(githubService, 'fetchAllUserRepos').mockResolvedValue(null);

    await expect(fetchUserRepos('octocat', { sort: 'updated' })).rejects.toMatchObject({
      code: 'USER_NOT_FOUND',
      status: 404,
    });
  });

  it('throws REPO_NOT_FOUND when repo detail is missing', async () => {
    vi.spyOn(githubService, 'getRepoDetail').mockResolvedValue(null);

    await expect(fetchRepoDetail('octocat', 'missing-repo')).rejects.toMatchObject({
      code: 'REPO_NOT_FOUND',
      status: 404,
    });
  });

  it('does not cache when profile is not found', async () => {
    vi.spyOn(githubService, 'getUserProfile').mockResolvedValue(null);

    await expect(fetchUserProfile('ghost')).rejects.toThrow(GitHubError);
    expect(cache.get('user:ghost')).toBeNull();
  });

  it('does not cache when repo detail is not found', async () => {
    vi.spyOn(githubService, 'getRepoDetail').mockResolvedValue(null);

    await expect(fetchRepoDetail('octocat', 'missing-repo')).rejects.toThrow(GitHubError);
    expect(cache.get('repo:octocat:missing-repo')).toBeNull();
  });

  it('throws ValidationError for invalid sort', async () => {
    await expect(fetchUserRepos('octocat', { sort: 'invalid' })).rejects.toThrow(ValidationError);
  });

  it('throws ValidationError for page above max', async () => {
    await expect(fetchUserRepos('octocat', { page: 101 })).rejects.toThrow(ValidationError);
  });

  it('caches sorted repos by sort and order', async () => {
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

    await fetchUserRepos('octocat', { page: 1, sort: 'stars', order: 'desc' });
    await fetchUserRepos('octocat', { page: 2, sort: 'stars', order: 'desc' });

    expect(cache.get('repos:octocat:all:stars:desc')).not.toBeNull();
  });

  it('throws ValidationError for invalid order', async () => {
    await expect(fetchUserRepos('octocat', { order: 'sideways' })).rejects.toThrow(ValidationError);
  });
});
