function getPaginationItems(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => ({ type: 'page', value: i + 1 }));
  }

  const items = [];
  const delta = 1;
  const pages = new Set([1, total]);

  for (let i = current - delta; i <= current + delta; i++) {
    if (i >= 1 && i <= total) pages.add(i);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  let prev = null;

  for (const n of sorted) {
    if (prev !== null && n - prev > 1) {
      items.push({ type: 'ellipsis', key: `ellipsis-${prev}-${n}` });
    }
    items.push({ type: 'page', value: n });
    prev = n;
  }

  return items;
}

export default function Pagination({ page, totalPages, onPageChange, disabled }) {
  if (totalPages <= 1) return null;

  const items = getPaginationItems(page, totalPages);

  return (
    <nav className="pagination" aria-label="Repository pages">
      <button
        type="button"
        className="pagination-nav"
        onClick={() => onPageChange(page - 1)}
        disabled={disabled || page <= 1}
        aria-label="Previous page"
      >
        ‹
      </button>

      <div className="pagination-pages">
        {items.map((item) =>
          item.type === 'ellipsis' ? (
            <span key={item.key} className="pagination-ellipsis" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={item.value}
              type="button"
              className={`pagination-page${item.value === page ? ' pagination-page--active' : ''}`}
              onClick={() => onPageChange(item.value)}
              disabled={disabled}
              aria-label={`Page ${item.value}`}
              aria-current={item.value === page ? 'page' : undefined}
            >
              {item.value}
            </button>
          )
        )}
      </div>

      <button
        type="button"
        className="pagination-nav"
        onClick={() => onPageChange(page + 1)}
        disabled={disabled || page >= totalPages}
        aria-label="Next page"
      >
        ›
      </button>
    </nav>
  );
}
