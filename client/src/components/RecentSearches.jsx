export default function RecentSearches({ searches, onSelect }) {
  if (searches.length === 0) return null;

  return (
    <aside className="recent-searches">
      <h2>Recent searches</h2>
      <ul>
        {searches.map((name) => (
          <li key={name}>
            <button type="button" onClick={() => onSelect(name)}>
              @{name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
