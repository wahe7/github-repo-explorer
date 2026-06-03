import { REPOS_PER_PAGE } from '../constants/github.js';

function toRepo(repo) {
  return {
    id: repo.id,
    name: repo.name,
    description: repo.description,
    language: repo.language,
    stars: repo.stargazers_count,
    updatedAt: repo.updated_at,
    htmlUrl: repo.html_url,
    openIssuesCount: repo.open_issues_count,
    defaultBranch: repo.default_branch,
  };
}

function toRepoDetail(repo) {
  return {
    name: repo.name,
    openIssuesCount: repo.open_issues_count,
    defaultBranch: repo.default_branch,
    htmlUrl: repo.html_url,
  };
}

function toReposList(repos, page, totalCount = null) {
  const hasMore =
    totalCount !== null
      ? page * REPOS_PER_PAGE < totalCount
      : repos.length === REPOS_PER_PAGE;

  const totalPages =
    totalCount !== null ? Math.max(1, Math.ceil(totalCount / REPOS_PER_PAGE)) : null;

  return { repos, page, hasMore, totalCount, totalPages };
}

export { toRepo, toRepoDetail, toReposList };
