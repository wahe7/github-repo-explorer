import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { cache } from '../../src/services/cache.js';
import { GitHubError } from '../../src/utils/githubError.js';
import * as userService from '../../src/services/userService.js';

vi.mock('../../src/services/userService.js', () => ({
  fetchUserProfile: vi.fn(),
  fetchUserRepos: vi.fn(),
  fetchRepoDetail: vi.fn(),
}));

describe('API routes', () => {
  const app = createApp();

  beforeEach(() => {
    cache.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cache.clear();
  });

  it('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('GET /api/users/:username returns profile', async () => {
    userService.fetchUserProfile.mockResolvedValue({
      login: 'octocat',
      avatarUrl: 'https://example.com/a.png',
      name: 'The Octocat',
      bio: null,
      followers: 1,
      following: 1,
      publicRepos: 8,
      htmlUrl: 'https://github.com/octocat',
    });

    const res = await request(app).get('/api/users/octocat');
    expect(res.status).toBe(200);
    expect(res.body.login).toBe('octocat');
  });

  it('GET /api/users/:username/repos returns repos', async () => {
    userService.fetchUserRepos.mockResolvedValue({
      repos: [{ id: 1, name: 'Hello-World', stars: 10 }],
      page: 1,
      hasMore: false,
    });

    const res = await request(app).get('/api/users/octocat/repos?sort=stars&page=1');
    expect(res.status).toBe(200);
    expect(res.body.repos).toHaveLength(1);
  });

  it('GET /api/users/:username/repos/:repoName returns repo detail', async () => {
    userService.fetchRepoDetail.mockResolvedValue({
      name: 'Hello-World',
      openIssuesCount: 2,
      defaultBranch: 'main',
      htmlUrl: 'https://github.com/octocat/Hello-World',
    });

    const res = await request(app).get('/api/users/octocat/repos/Hello-World');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Hello-World');
  });

  it('returns 400 for invalid sort', async () => {
    const res = await request(app).get('/api/users/octocat/repos?sort=invalid');
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for page below 1', async () => {
    const res = await request(app).get('/api/users/octocat/repos?page=0');
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for page above max', async () => {
    const res = await request(app).get('/api/users/octocat/repos?page=101');
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for invalid username format', async () => {
    const res = await request(app).get('/api/users/not valid!/repos');
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('returns 404 JSON for unknown routes', async () => {
    const res = await request(app).get('/api/unknown');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Not found', code: 'NOT_FOUND' });
  });

  it('returns 404 when user is not found', async () => {
    userService.fetchUserProfile.mockRejectedValue(
      new GitHubError('User not found', 'USER_NOT_FOUND', 404)
    );

    const res = await request(app).get('/api/users/ghost');
    expect(res.status).toBe(404);
    expect(res.body.code).toBe('USER_NOT_FOUND');
  });
});
