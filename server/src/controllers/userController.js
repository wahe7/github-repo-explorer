import { fetchUserProfile, fetchUserRepos, streamUserRepos, fetchRepoDetail } from '../services/userService.js';
import { usernameParamsSchema, repoParamsSchema, reposQuerySchema, reposStreamQuerySchema, validateParams, validateQuery } from '../validators/userValidator.js';

async function getProfile(req, res, next) {
  try {
    const { username } = validateParams(usernameParamsSchema, req.params);
    const profile = await fetchUserProfile(username);
    res.json(profile);
  } catch (error) {
    next(error);
  }
}

async function getRepos(req, res, next) {
  try {
    const { username } = validateParams(usernameParamsSchema, req.params);
    const { page, sort, order } = validateQuery(reposQuerySchema, req.query);
    const result = await fetchUserRepos(username, { page, sort, order });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function getReposStream(req, res, next) {
  try {
    const { username } = validateParams(usernameParamsSchema, req.params);
    const { sort, order } = validateQuery(reposStreamQuerySchema, req.query);
    await streamUserRepos(username, { sort, order }, res);
  } catch (error) {
    next(error);
  }
}

async function getRepoDetail(req, res, next) {
  try {
    const { username, repoName } = validateParams(repoParamsSchema, req.params);
    const detail = await fetchRepoDetail(username, repoName);
    res.json(detail);
  } catch (error) {
    next(error);
  }
}

export { getProfile, getRepos, getReposStream, getRepoDetail };
