import { GitHubError } from '../utils/githubError.js';
import { ValidationError } from '../utils/validationError.js';

function errorHandler(err, _req, res, _next) {
  if (err instanceof GitHubError) {
    return res.status(err.status).json({
      error: err.message,
      code: err.code,
    });
  }

  if (err instanceof ValidationError) {
    return res.status(err.status).json({
      error: err.message,
      code: err.code,
    });
  }

  console.error(err);
  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
  });
}

export { errorHandler };
