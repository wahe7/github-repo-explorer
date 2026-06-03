function sortRepos(repos, sort, order = 'desc') {
  const dir = order === 'asc' ? 1 : -1;

  const compare = {
    stars: (a, b) => (a.stars - b.stars) * dir,
    name: (a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }) * dir,
    updated: (a, b) => (new Date(a.updatedAt) - new Date(b.updatedAt)) * dir,
  }[sort];

  return [...repos].sort(compare);
}

export { sortRepos };
