class GitHubError extends Error {
  constructor(message, code, status) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

async function parseJsonBody(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

async function handleResponse(response, notFound = {}) {
  if (response.status === 404) {
    throw new GitHubError(
      notFound.message || 'User not found',
      notFound.code || 'USER_NOT_FOUND',
      404
    );
  }

  if (response.status === 403) {
    const remaining = response.headers.get('x-ratelimit-remaining');
    const body = await parseJsonBody(response);
    const message = body.message?.toLowerCase() ?? '';

    if (remaining === '0' || message.includes('rate limit')) {
      throw new GitHubError(
        'GitHub rate limit exceeded. Try again later.',
        'RATE_LIMIT',
        429
      );
    }

    throw new GitHubError(
      body.message || 'Access to GitHub was forbidden.',
      'GITHUB_ERROR',
      403
    );
  }

  if (response.status === 401) {
    console.error('GitHub API returned 401 — check GITHUB_TOKEN in server/.env');
    throw new GitHubError('Unable to authenticate with GitHub.', 'AUTH_ERROR', 401);
  }

  if (!response.ok) {
    throw new GitHubError(
      'Unable to fetch data from GitHub.',
      'GITHUB_ERROR',
      response.status
    );
  }

  return response.json();
}

export { GitHubError, handleResponse };
