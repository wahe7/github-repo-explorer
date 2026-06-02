import { describe, it, expect } from 'vitest';
import {
  usernameParamsSchema,
  repoParamsSchema,
  reposQuerySchema,
  validateParams,
  validateQuery,
} from '../src/validators/userValidator.js';

describe('userValidator', () => {
  describe('usernameParamsSchema', () => {
    it('accepts a valid username string', () => {
      const result = usernameParamsSchema.safeParse({ username: 'octocat' });
      expect(result.success).toBe(true);
    });

    it('rejects missing username', () => {
      const result = usernameParamsSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('rejects empty username', () => {
      const result = usernameParamsSchema.safeParse({ username: '' });
      expect(result.success).toBe(false);
    });

    it('rejects non-string username', () => {
      const result = usernameParamsSchema.safeParse({ username: 123 });
      expect(result.success).toBe(false);
    });
  });

  describe('repoParamsSchema', () => {
    it('accepts valid username and repoName', () => {
      const result = repoParamsSchema.safeParse({
        username: 'octocat',
        repoName: 'Hello-World',
      });
      expect(result.success).toBe(true);
    });

    it('rejects missing repoName', () => {
      const result = repoParamsSchema.safeParse({ username: 'octocat' });
      expect(result.success).toBe(false);
    });
  });

  describe('validateParams', () => {
    it('throws VALIDATION_ERROR for invalid params', () => {
      expect(() => validateParams(usernameParamsSchema, { username: '' })).toThrow(
        expect.objectContaining({ code: 'VALIDATION_ERROR', status: 400 })
      );
    });

    it('returns parsed data for valid params', () => {
      const data = validateParams(usernameParamsSchema, { username: 'octocat' });
      expect(data).toEqual({ username: 'octocat' });
    });
  });

  describe('reposQuerySchema', () => {
    it('accepts valid sort values', () => {
      for (const sort of ['stars', 'name', 'updated']) {
        expect(reposQuerySchema.safeParse({ sort }).success).toBe(true);
      }
    });

    it('rejects invalid sort values', () => {
      expect(reposQuerySchema.safeParse({ sort: 'invalid' }).success).toBe(false);
    });

    it('rejects page values below 1', () => {
      expect(reposQuerySchema.safeParse({ page: 0 }).success).toBe(false);
    });

    it('rejects page values above max', () => {
      expect(reposQuerySchema.safeParse({ page: 101 }).success).toBe(false);
    });

    it('rejects invalid username format', () => {
      expect(usernameParamsSchema.safeParse({ username: 'not valid!' }).success).toBe(false);
    });

    it('defaults page and sort', () => {
      expect(reposQuerySchema.parse({})).toEqual({ page: 1, sort: 'updated' });
    });
  });

  describe('validateQuery', () => {
    it('throws VALIDATION_ERROR for invalid sort', () => {
      expect(() => validateQuery(reposQuerySchema, { sort: 'bad' })).toThrow(
        expect.objectContaining({ code: 'VALIDATION_ERROR', status: 400 })
      );
    });
  });
});
