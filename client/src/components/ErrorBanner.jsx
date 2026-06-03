export default function ErrorBanner({ error, onRetry }) {
  const messages = {
    USER_NOT_FOUND: 'GitHub user not found. Check the username and try again.',
    REPO_NOT_FOUND: 'Repository not found. It may have been renamed or deleted.',
    TIMEOUT_ERROR: 'The request timed out. Please try again.',
    RATE_LIMIT: 'GitHub rate limit exceeded. Please wait a moment and try again.',
    NETWORK_ERROR: 'Unable to reach the server. Check your connection and try again.',
    AUTH_ERROR: 'Unable to authenticate with GitHub. Please try again later.',
  };

  const message = messages[error.code] || error.message || 'Something went wrong.';

  return (
    <div className="error-banner" role="alert">
      <p>{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
