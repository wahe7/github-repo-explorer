import { describe, it, expect, vi } from 'vitest';
import { GitHubError, handleResponse } from '../src/utils/githubError.js';
import { ValidationError } from '../src/utils/validationError.js';
import { errorHandler } from '../src/middleware/errorHandler.js';

describe('GitHubError', () => {
  it('carries message, code, and status', () => {
    const err = new GitHubError('User not found', 'USER_NOT_FOUND', 404);
    expect(err.message).toBe('User not found');
    expect(err.code).toBe('USER_NOT_FOUND');
    expect(err.status).toBe(404);
    expect(err).toBeInstanceOf(Error);
  });
});

describe('handleResponse', () => {
  it('maps 401 to generic auth error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const response = {
      status: 401,
      ok: false,
      headers: new Headers(),
      json: async () => ({}),
    };

    await expect(handleResponse(response)).rejects.toMatchObject({
      code: 'AUTH_ERROR',
      status: 401,
      message: 'Unable to authenticate with GitHub.',
    });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('maps 403 rate limit via remaining header', async () => {
    const response = {
      status: 403,
      ok: false,
      headers: new Headers({ 'x-ratelimit-remaining': '0' }),
      json: async () => ({}),
    };

    await expect(handleResponse(response)).rejects.toMatchObject({
      code: 'RATE_LIMIT',
      status: 429,
    });
  });

  it('maps 403 rate limit via response message', async () => {
    const response = {
      status: 403,
      ok: false,
      headers: new Headers(),
      json: async () => ({ message: 'You have exceeded a secondary rate limit.' }),
    };

    await expect(handleResponse(response)).rejects.toMatchObject({
      code: 'RATE_LIMIT',
      status: 429,
    });
  });
});

describe('errorHandler', () => {
  it('maps GitHubError to JSON response', () => {
    const err = new GitHubError('User not found', 'USER_NOT_FOUND', 404);
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    errorHandler(err, {}, res, () => {});

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: 'User not found',
      code: 'USER_NOT_FOUND',
    });
  });

  it('maps ValidationError to JSON response', () => {
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    errorHandler(new ValidationError('sort must be one of: stars, name, updated'), {}, res, () => {});

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'sort must be one of: stars, name, updated',
      code: 'VALIDATION_ERROR',
    });
  });

  it('returns 500 for unknown errors', () => {
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    errorHandler(new Error('unexpected'), {}, res, () => {});

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  });
});
