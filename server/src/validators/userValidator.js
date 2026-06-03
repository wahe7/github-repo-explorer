import { z } from 'zod';
import { VALID_SORTS, DEFAULT_SORT, VALID_ORDERS, DEFAULT_ORDER, MAX_PAGE } from '../constants/github.js';
import { ValidationError } from '../utils/validationError.js';

const GITHUB_USERNAME = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;

const usernameParamsSchema = z.object({
  username: z
    .string({ message: 'username must be a string' })
    .min(1, 'username is required')
    .max(39, 'username must be at most 39 characters')
    .regex(GITHUB_USERNAME, 'username format is invalid'),
});

const repoParamsSchema = z.object({
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

const reposQuerySchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1, 'page must be at least 1')
    .max(MAX_PAGE, `page must be at most ${MAX_PAGE}`)
    .default(1),
  sort: z
    .enum(VALID_SORTS, { message: `sort must be one of: ${VALID_SORTS.join(', ')}` })
    .default(DEFAULT_SORT),
  order: z
    .enum(VALID_ORDERS, { message: `order must be one of: ${VALID_ORDERS.join(', ')}` })
    .default(DEFAULT_ORDER),
});

const reposStreamQuerySchema = reposQuerySchema.omit({ page: true });

function throwValidationError(schema, data) {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new ValidationError(result.error.issues[0].message);
  }

  return result.data;
}

function validateParams(schema, params) {
  return throwValidationError(schema, params);
}

function validateQuery(schema, query) {
  return throwValidationError(schema, query);
}

export {
  usernameParamsSchema,
  repoParamsSchema,
  reposQuerySchema,
  reposStreamQuerySchema,
  validateParams,
  validateQuery,
};
