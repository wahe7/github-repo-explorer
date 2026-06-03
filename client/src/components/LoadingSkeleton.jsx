export default function LoadingSkeleton() {
  return (
    <div className="loading-skeleton" aria-busy="true" aria-label="Loading">
      <div className="skeleton skeleton-avatar" />
      <div className="skeleton-lines">
        <div className="skeleton skeleton-line skeleton-line-lg" />
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line skeleton-line-sm" />
      </div>
      <div className="skeleton-repo-list">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton skeleton-repo" />
        ))}
      </div>
    </div>
  );
}
