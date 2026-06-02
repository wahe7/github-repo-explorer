import { cache } from './cache.js';
import { getUserProfile, getUserRepos, getAllUserReposSorted, getRepoDetail } from './githubService.js';
import { GitHubError } from '../utils/githubError.js';
import { ValidationError } from '../utils/validationError.js';
import { toReposList } from '../dao/repoDao.js';
import { REPOS_PER_PAGE, VALID_SORTS, MAX_PAGE } from '../constants/github.js';

function userCacheKey(username) {
  return `user:${username.toLowerCase()}`;
}

function reposCacheKey(username, page, sort) {
  return `repos:${username.toLowerCase()}:page:${page}:sort:${sort}`;
}

function allStarsCacheKey(username) {
  return `repos:${username.toLowerCase()}:all:sort:stars`;
}

function repoCacheKey(username, repoName) {
  return `repo:${username.toLowerCase()}:${repoName.toLowerCase()}`;
}

function assertValidSort(sort) {
  if (!VALID_SORTS.includes(sort)) {
    throw new ValidationError(`sort must be one of: ${VALID_SORTS.join(', ')}`);
  }
}

function assertValidPage(page) {
  if (!Number.isInteger(page) || page < 1 || page > MAX_PAGE) {
    throw new ValidationError(`page must be between 1 and ${MAX_PAGE}`);
  }
}

async function fetchStarsPage(username, page) {
  const allCacheKey = allStarsCacheKey(username);
  let allSorted = cache.get(allCacheKey);

  if (!allSorted) {
    allSorted = await getAllUserReposSorted(username);
    cache.set(allCacheKey, allSorted);
  }

  const start = (page - 1) * REPOS_PER_PAGE;
  return toReposList(allSorted.slice(start, start + REPOS_PER_PAGE), page, allSorted.length);
}

export async function fetchUserProfile(username) {
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

export async function fetchUserRepos(username, { page = 1, sort = 'updated' } = {}) {
  assertValidSort(sort);
  assertValidPage(page);

  if (sort === 'stars') {
    const result = await fetchStarsPage(username, page);

    if (!Array.isArray(result.repos)) {
      throw new GitHubError('User not found', 'USER_NOT_FOUND', 404);
    }

    return result;
  }

  const cacheKey = reposCacheKey(username, page, sort);
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const result = await getUserRepos(username, { page, sort });

  if (!result || !Array.isArray(result.repos)) {
    throw new GitHubError('User not found', 'USER_NOT_FOUND', 404);
  }

  cache.set(cacheKey, result);
  return result;
}

export async function fetchRepoDetail(username, repoName) {
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
