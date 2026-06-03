import { useState } from 'react';
import { fetchRepoDetail } from '../api/github.js';

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function RepoItem({ repo, username }) {
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  async function toggleExpand() {
    if (expanded) {
      setExpanded(false);
      return;
    }

    setExpanded(true);

    if (detail) return;

    setLoadingDetail(true);
    try {
      const data = await fetchRepoDetail(username, repo.name);
      setDetail(data);
    } catch {
      setDetail({
        openIssuesCount: repo.openIssuesCount,
        defaultBranch: repo.defaultBranch,
      });
    } finally {
      setLoadingDetail(false);
    }
  }

  return (
    <article className={`repo-item ${expanded ? 'repo-item-expanded' : ''}`}>
      <div className="repo-header">
        <h3>
          <a href={repo.htmlUrl} target="_blank" rel="noreferrer">
            {repo.name}
          </a>
        </h3>
        <button
          type="button"
          className="repo-expand-btn"
          onClick={toggleExpand}
          aria-expanded={expanded}
        >
          {expanded ? 'Hide details' : 'Show details'}
        </button>
      </div>

      {repo.description && <p className="repo-description">{repo.description}</p>}

      <ul className="repo-meta">
        {repo.language && <li>{repo.language}</li>}
        <li>★ {repo.stars.toLocaleString()}</li>
        <li>Updated {formatDate(repo.updatedAt)}</li>
      </ul>

      {expanded && (
        <div className="repo-detail">
          {loadingDetail ? (
            <p className="repo-detail-loading">Loading details…</p>
          ) : (
            <ul>
              <li>
                <strong>Open issues:</strong> {detail?.openIssuesCount ?? '—'}
              </li>
              <li>
                <strong>Default branch:</strong> {detail?.defaultBranch ?? '—'}
              </li>
            </ul>
          )}
        </div>
      )}
    </article>
  );
}
