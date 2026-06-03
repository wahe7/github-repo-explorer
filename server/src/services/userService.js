import { cache } from './cache.js';
import { getUserProfile, fetchAllUserRepos, streamRepoBatchesFromGitHub, getRepoDetail } from './githubService.js';
import { GitHubError } from '../utils/githubError.js';
import { ValidationError } from '../utils/validationError.js';
import { toReposList } from '../dao/repoDao.js';
import { sortRepos } from '../utils/repoSort.js';
import { REPOS_PER_PAGE, VALID_SORTS, VALID_ORDERS, MAX_PAGE } from '../constants/github.js';

function userCacheKey(username) {
  return `user:${username.toLowerCase()}`;
}

function allReposCacheKey(username, sort, order) {
  return `repos:${username.toLowerCase()}:all:${sort}:${order}`;
}

function repoCacheKey(username, repoName) {
  return `repo:${username.toLowerCase()}:${repoName.toLowerCase()}`;
}

function assertValidSort(sort) {
  if (!VALID_SORTS.includes(sort)) {
    throw new ValidationError(`sort must be one of: ${VALID_SORTS.join(', ')}`);
  }
}

function assertValidOrder(order) {
  if (!VALID_ORDERS.includes(order)) {
    throw new ValidationError(`order must be one of: ${VALID_ORDERS.join(', ')}`);
  }
}

function assertValidPage(page) {
  if (!Number.isInteger(page) || page < 1 || page > MAX_PAGE) {
    throw new ValidationError(`page must be between 1 and ${MAX_PAGE}`);
  }
}

async function getSortedRepos(username, sort, order) {
  const cacheKey = allReposCacheKey(username, sort, order);
  let allSorted = cache.get(cacheKey);

  if (!allSorted) {
    const allRepos = await fetchAllUserRepos(username);

    if (!Array.isArray(allRepos)) {
      throw new GitHubError('User not found', 'USER_NOT_FOUND', 404);
    }

    allSorted = sortRepos(allRepos, sort, order);
    cache.set(cacheKey, allSorted);
  }

  return allSorted;
}

async function fetchSortedPage(username, page, sort, order) {
  const allSorted = await getSortedRepos(username, sort, order);
  const start = (page - 1) * REPOS_PER_PAGE;
  return toReposList(allSorted.slice(start, start + REPOS_PER_PAGE), page, allSorted.length);
}

async function fetchUserProfile(username) {
  const cacheKey = userCacheKey(username);
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const profile = await getUserProfile(username);

  if (!profile?.login) {
    throw new GitHubError('User not found', 'USER_NOT_FOUND', 404);
  }

  cache.set(cacheKey, profile);
  return profile;
}

async function fetchUserRepos(username, { page = 1, sort = 'updated', order = 'desc' } = {}) {
  assertValidSort(sort);
  assertValidOrder(order);
  assertValidPage(page);

  const result = await fetchSortedPage(username, page, sort, order);

  if (!Array.isArray(result.repos)) {
    throw new GitHubError('User not found', 'USER_NOT_FOUND', 404);
  }

  return result;
}

async function streamUserRepos(username, { sort = 'updated', order = 'desc' }, res) {
  assertValidSort(sort);
  assertValidOrder(order);

  res.setHeader('Content-Type', 'application/x-ndjson');
  res.setHeader('Cache-Control', 'no-cache');
  res.flushHeaders?.();

  const cacheKey = allReposCacheKey(username, sort, order);
  let allSorted = cache.get(cacheKey);

  if (!allSorted) {
    const allRepos = [];

    for await (const batch of streamRepoBatchesFromGitHub(username)) {
      allRepos.push(...batch);
      res.write(`${JSON.stringify({ type: 'progress', fetched: allRepos.length })}\n`);

      const sortedSoFar = sortRepos(allRepos, sort, order);
      const preview = toReposList(
        sortedSoFar.slice(0, REPOS_PER_PAGE),
        1,
        sortedSoFar.length
      );
      res.write(
        `${JSON.stringify({ type: 'page', partial: true, sort, order, ...preview })}\n`
      );
      res.flush?.();
    }

    allSorted = sortRepos(allRepos, sort, order);
    cache.set(cacheKey, allSorted);
  }

  const totalCount = allSorted.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / REPOS_PER_PAGE));

  res.write(`${JSON.stringify({ type: 'done', totalCount, totalPages })}\n`);

  for (let p = 1; p <= totalPages; p++) {
    const start = (p - 1) * REPOS_PER_PAGE;
    const pageRepos = allSorted.slice(start, start + REPOS_PER_PAGE);
    const chunk = toReposList(pageRepos, p, totalCount);
    res.write(`${JSON.stringify({ type: 'page', partial: false, sort, order, ...chunk })}\n`);
    res.flush?.();
  }

  res.end();
}

async function fetchRepoDetail(username, repoName) {
  const cacheKey = repoCacheKey(username, repoName);
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const detail = await getRepoDetail(username, repoName);

  if (!detail?.name) {
    throw new GitHubError('Repository not found', 'REPO_NOT_FOUND', 404);
  }

  cache.set(cacheKey, detail);
  return detail;
}

export { fetchUserProfile, fetchUserRepos, streamUserRepos, fetchRepoDetail };
