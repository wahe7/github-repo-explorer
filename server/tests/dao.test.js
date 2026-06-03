import { describe, it, expect } from 'vitest';
import { toUserProfile } from '../src/dao/userDao.js';
import { toRepo, toRepoDetail, toReposList } from '../src/dao/repoDao.js';

describe('userDao', () => {
  it('maps GitHub user payload to API response', () => {
    const result = toUserProfile({
      login: 'octocat',
      avatar_url: 'https://example.com/avatar.png',
      name: 'The Octocat',
      bio: 'GitHub mascot',
      followers: 9000,
      following: 9,
      public_repos: 8,
      html_url: 'https://github.com/octocat',
    });

    expect(result).toEqual({
      login: 'octocat',
      avatarUrl: 'https://example.com/avatar.png',
      name: 'The Octocat',
      bio: 'GitHub mascot',
      followers: 9000,
      following: 9,
      publicRepos: 8,
      htmlUrl: 'https://github.com/octocat',
    });
  });
});

describe('repoDao', () => {
  const githubRepo = {
    id: 1,
    name: 'Hello-World',
    description: 'My first repo',
    language: 'JavaScript',
    stargazers_count: 1500,
    updated_at: '2024-01-15T10:00:00Z',
    html_url: 'https://github.com/octocat/Hello-World',
    open_issues_count: 5,
    default_branch: 'main',
  };

  it('maps GitHub repo payload to API response', () => {
    expect(toRepo(githubRepo)).toEqual({
      id: 1,
      name: 'Hello-World',
      description: 'My first repo',
      language: 'JavaScript',
      stars: 1500,
      updatedAt: '2024-01-15T10:00:00Z',
      htmlUrl: 'https://github.com/octocat/Hello-World',
      openIssuesCount: 5,
      defaultBranch: 'main',
    });
  });

  it('maps GitHub repo payload to detail response', () => {
    expect(toRepoDetail(githubRepo)).toEqual({
      name: 'Hello-World',
      openIssuesCount: 5,
      defaultBranch: 'main',
      htmlUrl: 'https://github.com/octocat/Hello-World',
    });
  });

  it('builds paginated repos list response', () => {
    const repos = Array.from({ length: 10 }, (_, i) => ({ id: i, name: `repo-${i}` }));

    expect(toReposList(repos, 2)).toEqual({
      repos,
      page: 2,
      hasMore: true,
      totalCount: null,
      totalPages: null,
    });
  });

  it('uses totalCount for hasMore when sorting across all repos', () => {
    const repos = Array.from({ length: 10 }, (_, i) => ({ id: i, name: `repo-${i}` }));

    expect(toReposList(repos, 1, 45)).toEqual({
      repos,
      page: 1,
      hasMore: true,
      totalCount: 45,
      totalPages: 5,
    });

    expect(toReposList(repos.slice(0, 5), 5, 45)).toEqual({
      repos: repos.slice(0, 5),
      page: 5,
      hasMore: false,
      totalCount: 45,
      totalPages: 5,
    });
  });
});
