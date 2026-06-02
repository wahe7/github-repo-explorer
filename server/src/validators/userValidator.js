import { z } from 'zod';
import { VALID_SORTS, DEFAULT_SORT, MAX_PAGE } from '../constants/github.js';
import { ValidationError } from '../utils/validationError.js';

const GITHUB_USERNAME = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;

export const usernameParamsSchema = z.object({
  username: z
    .string({ message: 'username must be a string' })
    .min(1, 'username is required')
    .max(39, 'username must be at most 39 characters')
    .regex(GITHUB_USERNAME, 'username format is invalid'),
});

export const repoParamsSchema = z.object({
  username: z
    .string({ message: 'username must be a string' })
    .min(1, 'username is required')
    .max(39, 'username must be at most 39 characters')
    .regex(GITHUB_USERNAME, 'username format is invalid'),
  repoName: z
    .string({ message: 'repoName must be a string' })
    .min(1, 'repoName is required')
    .max(100, 'repoName must be at most 100 characters'),
});

export const reposQuerySchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1, 'page must be at least 1')
    .max(MAX_PAGE, `page must be at most ${MAX_PAGE}`)
    .default(1),
  sort: z
    .enum(VALID_SORTS, { message: `sort must be one of: ${VALID_SORTS.join(', ')}` })
    .default(DEFAULT_SORT),
});

function throwValidationError(schema, data) {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new ValidationError(result.error.issues[0].message);
  }

  return result.data;
}

export function validateParams(schema, params) {
  return throwValidationError(schema, params);
}

export function validateQuery(schema, query) {
  return throwValidationError(schema, query);
}
