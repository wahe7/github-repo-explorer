import { describe, it, expect } from 'vitest';
import { sortRepos } from '../src/utils/repoSort.js';

const repos = [
  { id: 1, name: 'beta', stars: 10, updatedAt: '2024-02-01' },
  { id: 2, name: 'alpha', stars: 50, updatedAt: '2024-01-01' },
  { id: 3, name: 'gamma', stars: 5, updatedAt: '2024-03-01' },
];

describe('sortRepos', () => {
  it('sorts by stars descending', () => {
    const sorted = sortRepos(repos, 'stars', 'desc');
    expect(sorted.map((r) => r.stars)).toEqual([50, 10, 5]);
  });

  it('sorts by stars ascending', () => {
    const sorted = sortRepos(repos, 'stars', 'asc');
    expect(sorted.map((r) => r.stars)).toEqual([5, 10, 50]);
  });

  it('sorts by name ascending', () => {
    const sorted = sortRepos(repos, 'name', 'asc');
    expect(sorted.map((r) => r.name)).toEqual(['alpha', 'beta', 'gamma']);
  });

  it('sorts by updated descending', () => {
    const sorted = sortRepos(repos, 'updated', 'desc');
    expect(sorted.map((r) => r.name)).toEqual(['gamma', 'beta', 'alpha']);
  });
});
