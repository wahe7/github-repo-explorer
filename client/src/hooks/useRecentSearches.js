const STORAGE_KEY = 'github-recent-searches';
const MAX_ENTRIES = 8;

export function useRecentSearches() {
  function getRecent() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  function addRecent(username) {
    const trimmed = username.trim();
    if (!trimmed) return getRecent();

    const current = getRecent().filter((entry) => entry !== trimmed);
    const updated = [trimmed, ...current].slice(0, MAX_ENTRIES);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore storage errors
    }

    return updated;
  }

  return { getRecent, addRecent };
}
