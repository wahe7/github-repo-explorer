const GITHUB_API = 'https://api.github.com';

/** Repos shown per UI/API page */
const REPOS_PER_PAGE = 10;
/** Repos requested per GitHub API call (max allowed by GitHub) */
const GITHUB_FETCH_PER_PAGE = 100;
const REQUEST_TIMEOUT_MS = 10_000;
const VALID_SORTS = ['stars', 'name', 'updated'];
const DEFAULT_SORT = 'updated';
const VALID_ORDERS = ['asc', 'desc'];
const DEFAULT_ORDER = 'desc';
/** Max GitHub list pages to fetch when building a sorted catalog */
const MAX_REPO_PAGES = 100;
const MAX_REPOS_FETCHED = MAX_REPO_PAGES * GITHUB_FETCH_PER_PAGE;
/** Max page number (100 GitHub pages × 10 repos per page) */
const MAX_PAGE = 100;
/** Max age for cached sorted repos (60 seconds) */
const CACHE_DURATION_MS = 60_000;

export {
  GITHUB_API,
  REPOS_PER_PAGE,
  GITHUB_FETCH_PER_PAGE,
  REQUEST_TIMEOUT_MS,
  VALID_SORTS,
  DEFAULT_SORT,
  VALID_ORDERS,
  DEFAULT_ORDER,
  MAX_REPO_PAGES,
  MAX_REPOS_FETCHED,
  MAX_PAGE,
  CACHE_DURATION_MS,
};
