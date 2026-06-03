import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { InMemoryCache, cache } from '../src/services/cache.js';

describe('InMemoryCache', () => {
  let testCache;

  beforeEach(() => {
    testCache = new InMemoryCache(1000);
  });

  it('returns null for missing keys', () => {
    expect(testCache.get('missing')).toBeNull();
  });

  it('stores and retrieves data within TTL', () => {
    testCache.set('user:octocat', { login: 'octocat' });
    expect(testCache.get('user:octocat')).toEqual({ login: 'octocat' });
  });

  it('expires entries after TTL', () => {
    vi.useFakeTimers();
    testCache.set('user:octocat', { login: 'octocat' });

    vi.advanceTimersByTime(1001);

    expect(testCache.get('user:octocat')).toBeNull();
    vi.useRealTimers();
  });

  it('clears all entries', () => {
    testCache.set('a', 1);
    testCache.set('b', 2);
    testCache.clear();
    expect(testCache.get('a')).toBeNull();
    expect(testCache.get('b')).toBeNull();
  });
});

describe('shared cache singleton', () => {
  afterEach(() => {
    cache.clear();
  });

  it('uses 60 second TTL by default', () => {
    cache.set('test', 'value');
    expect(cache.get('test')).toBe('value');
  });
});
