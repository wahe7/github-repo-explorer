const TTL_MS = 60 * 1000;

class InMemoryCache {
  constructor(ttlMs = TTL_MS) {
    this.ttlMs = ttlMs;
    this.store = new Map();
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key, data) {
    this.store.set(key, {
      data,
      expiresAt: Date.now() + this.ttlMs,
    });
  }

  clear() {
    this.store.clear();
  }
}

const cache = new InMemoryCache();

export { InMemoryCache, cache };
