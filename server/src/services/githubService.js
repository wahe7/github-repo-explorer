import { GitHubError, handleResponse } from '../utils/githubError.js';
import { toUserProfile } from '../dao/userDao.js';
import { toRepo, toRepoDetail } from '../dao/repoDao.js';
import { GITHUB_API, GITHUB_FETCH_PER_PAGE, REQUEST_TIMEOUT_MS, MAX_REPO_PAGES } from '../constants/github.js';

function getHeaders() {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'github-repo-explorer',
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

async function fetchGitHub(path, notFound) {
  let response;

  try {
    response = await fetch(`${GITHUB_API}${path}`, {
      headers: getHeaders(),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      throw new GitHubError('Request to GitHub timed out.', 'TIMEOUT_ERROR', 504);
    }
    throw new GitHubError('Unable to reach GitHub.', 'NETWORK_ERROR', 503);
  }

  return handleResponse(response, notFound);
}

async function fetchRepoBatchFromGitHub(username, page) {
  const params = new URLSearchParams({
    per_page: String(GITHUB_FETCH_PER_PAGE),
    page: String(page),
  });

  const batch = await fetchGitHub(
    `/users/${encodeURIComponent(username)}/repos?${params.toString()}`
  );

  if (!Array.isArray(batch)) {
    throw new GitHubError('Unexpected response from GitHub.', 'GITHUB_ERROR', 502);
  }

  return batch.map(toRepo);
}

async function* streamRepoBatchesFromGitHub(username) {
  const first = await fetchRepoBatchFromGitHub(username, 1);
  if (first.length > 0) {
    yield first;
  }
  if (first.length < GITHUB_FETCH_PER_PAGE) {
    return;
  }

  const otherPages = Array.from({ length: MAX_REPO_PAGES - 1 }, (_, i) => i + 2);
  const rest = await Promise.all(
    otherPages.map((page) => fetchRepoBatchFromGitHub(username, page))
  );

  for (const repos of rest) {
    if (repos.length > 0) {
      yield repos;
    }
    if (repos.length < GITHUB_FETCH_PER_PAGE) {
      break;
    }
  }
}

async function fetchAllUserRepos(username) {
  const allRepos = [];

  for await (const batch of streamRepoBatchesFromGitHub(username)) {
    allRepos.push(...batch);
  }

  return allRepos;
}

async function getUserProfile(username) {
  const user = await fetchGitHub(`/users/${encodeURIComponent(username)}`);
  return toUserProfile(user);
}

async function getRepoDetail(username, repoName) {
  const repo = await fetchGitHub(
    `/repos/${encodeURIComponent(username)}/${encodeURIComponent(repoName)}`,
    { message: 'Repository not found', code: 'REPO_NOT_FOUND' }
  );

  return toRepoDetail(repo);
}

export {
  streamRepoBatchesFromGitHub,
  fetchAllUserRepos,
  getUserProfile,
  getRepoDetail,
};
