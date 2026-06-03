import RepoItem from './RepoItem.jsx';
import Pagination from './Pagination.jsx';

const SORT_OPTIONS = [
  { value: 'stars', label: 'Stars' },
  { value: 'name', label: 'Name' },
  { value: 'updated', label: 'Last updated' },
];

export default function RepoList({
  repos,
  username,
  publicRepos,
  sort,
  order,
  onSortChange,
  onOrderChange,
  page,
  totalPages,
  onPageChange,
  slideDirection,
}) {
  if (repos.length === 0 && publicRepos === 0) {
    return (
      <section className="repo-list">
        <h2>Repositories</h2>
        <p className="empty-state">This user has no public repositories.</p>
      </section>
    );
  }

  return (
    <section className="repo-list">
      <div className="repo-list-header">
        <h2>
          Repositories
          {publicRepos > 0 && (
            <span className="repo-count">
              {' '}
              ({publicRepos} total · page {page} of {totalPages})
            </span>
          )}
        </h2>
        <div className="repo-list-controls">
          <label className="sort-control">
            Sort by
            <select value={sort} onChange={(e) => onSortChange(e.target.value, order)}>
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="sort-control">
            Order
            <select value={order} onChange={(e) => onOrderChange(e.target.value)}>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </label>
        </div>
      </div>

      {repos.length > 0 && (
        <div className="repo-slider">
          <div
            key={page}
            className={`repo-items repo-slide-${slideDirection}`}
          >
            {repos.map((repo) => (
              <RepoItem key={repo.id} repo={repo} username={username} />
            ))}
          </div>
        </div>
      )}

      {repos.length > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </section>
  );
}
