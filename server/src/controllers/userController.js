import { fetchUserProfile, fetchUserRepos, fetchRepoDetail } from '../services/userService.js';
import { usernameParamsSchema, repoParamsSchema, reposQuerySchema, validateParams, validateQuery } from '../validators/userValidator.js';

export async function getProfile(req, res, next) {
  try {
    const { username } = validateParams(usernameParamsSchema, req.params);
    const profile = await fetchUserProfile(username);
    res.json(profile);
  } catch (error) {
    next(error);
  }
}

export async function getRepos(req, res, next) {
  try {
    const { username } = validateParams(usernameParamsSchema, req.params);
    const { page, sort } = validateQuery(reposQuerySchema, req.query);
    const result = await fetchUserRepos(username, { page, sort });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getRepoDetail(req, res, next) {
  try {
    const { username, repoName } = validateParams(repoParamsSchema, req.params);
    const detail = await fetchRepoDetail(username, repoName);
    res.json(detail);
  } catch (error) {
    next(error);
  }
}
