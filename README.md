# GitHub Repo Explorer

A full-stack web app where you enter a GitHub username and view that user's public profile and repositories. The React frontend talks only to a Node.js/Express backend, which proxies and caches requests to the GitHub REST API.

## Live Demo

Not deployed yet. See [Next Steps](#next-steps) for deployment plans.

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Backend | Node.js, Express (JavaScript) | Simple REST proxy; matches brief requirements |
| Architecture | Routes → Controllers → Services | Clear separation of HTTP handling, orchestration, and external API calls |
| Frontend | React + Vite (functional components, hooks) | Fast dev experience; modern React patterns |
| Styling | Plain CSS | Lightweight, responsive layout without extra dependencies |
| Caching | In-memory Map (60s TTL) | Reduces GitHub API calls and avoids rate limits |
| GitHub auth | Optional `GITHUB_TOKEN` in server `.env` | Raises rate limit from 60 to 5000 requests/hour |

## How to Run Locally

Assumes Node.js 18+ is installed.

```bash
# Terminal 1 — backend
cd server
npm install
cp .env.example .env
# Optionally add GITHUB_TOKEN to .env
npm run dev

# Terminal 2 — frontend
cd client
npm install
npm run dev
```

Open http://localhost:5173 in your browser. The Vite dev server proxies `/api` requests to the backend on port 3001.

## API Documentation

### `GET /api/health`

Health check.

**Response:** `{ "status": "ok" }`

### `GET /api/users/:username`

Returns a GitHub user's public profile.

**Response:**
```json
{
  "login": "octocat",
  "avatarUrl": "https://avatars.githubusercontent.com/u/583231?v=4",
  "name": "The Octocat",
  "bio": null,
  "followers": 9000,
  "following": 9,
  "publicRepos": 8,
  "htmlUrl": "https://github.com/octocat"
}
```

**Errors:**
| Status | Code | When |
|--------|------|------|
| 400 | `VALIDATION_ERROR` | Invalid username, sort, or page |
| 401 | `AUTH_ERROR` | Server unable to authenticate with GitHub |
| 404 | `USER_NOT_FOUND` | Username does not exist |
| 429 | `RATE_LIMIT` | GitHub rate limit exceeded |
| 503 | `NETWORK_ERROR` | Cannot reach GitHub |
| 504 | `TIMEOUT_ERROR` | GitHub request timed out |

### `GET /api/users/:username/repos?page=1&sort=stars|name|updated&order=asc|desc`

Returns paginated public repositories (10 per page). Repos are fetched from GitHub in batches of 10, sorted globally, then sliced per page.

**Query params:**
- `page` — page number, 1–100 (default: 1)
- `sort` — `stars`, `name`, or `updated` (default: `updated`)
- `order` — `asc` or `desc` (default: `desc`)

### `GET /api/users/:username/repos/stream?sort=stars|name|updated&order=asc|desc`

Streams repositories as NDJSON: `progress` while fetching from GitHub (100 per request), `page` previews for page 1 after each batch (so the UI can render immediately), then `done` plus final `page` events for every page (10 repos each).

> **Note:** Up to 10,000 repos may be fetched (100 GitHub pages × 100 per request) before sorting; the UI still shows 10 repos per page. Cached for 60s per username/sort/order.

**Response:**
```json
{
  "repos": [
    {
      "id": 123,
      "name": "Hello-World",
      "description": "My first repo",
      "language": "JavaScript",
      "stars": 1500,
      "updatedAt": "2024-01-15T10:00:00Z",
      "htmlUrl": "https://github.com/octocat/Hello-World",
      "openIssuesCount": 5,
      "defaultBranch": "main"
    }
  ],
  "page": 1,
  "hasMore": false,
  "totalCount": 8,
  "totalPages": 1
}
```

### `GET /api/users/:username/repos/:repoName`

Returns additional details for a single repository.

**Response:**
```json
{
  "name": "Hello-World",
  "openIssuesCount": 5,
  "defaultBranch": "main",
  "htmlUrl": "https://github.com/octocat/Hello-World"
}
```

## Project Structure

```
github-repo-explorer/
├── client/                         # Vite + React frontend
│   ├── src/
│   │   ├── api/github.js           # Fetch wrappers for backend API
│   │   ├── components/             # UI components
│   │   ├── hooks/                  # useGitHubUser, useRecentSearches
│   │   ├── App.jsx
│   │   └── App.css
│   └── vite.config.js              # Dev proxy to backend
├── server/                         # Express backend
│   ├── src/
│   │   ├── app.js                  # Express app factory (used by tests)
│   │   ├── routes/users.js         # Route definitions
│   │   ├── controllers/userController.js
│   │   ├── validators/userValidator.js
│   │   ├── services/
│   │   │   ├── userService.js      # Cache + orchestration
│   │   │   ├── githubService.js    # GitHub API client
│   │   │   └── cache.js            # In-memory cache (60s TTL)
│   │   ├── dao/                    # Response mappers
│   │   ├── utils/                  # GitHubError, ValidationError
│   │   ├── constants/github.js     # REPOS_PER_PAGE, GITHUB_FETCH_PER_PAGE, etc.
│   │   ├── middleware/errorHandler.js
│   │   └── index.js
│   └── .env.example
├── .gitignore
└── README.md
```

## What Works

- Username search with profile display (avatar, name, bio, followers, following, repo count)
- Sortable repository list (stars, name, last updated)
- Numbered page pagination with slide transitions (10 repos per page, streamed load)
- Sort by stars, name, or last updated with ascending or descending order
- Expandable repo details (open issues, default branch)
- Error handling for invalid usernames, rate limits, and network failures
- 60-second server-side response caching
- Loading skeletons and recent search history (localStorage)
- Responsive layout for mobile and desktop

## Next Steps

- Deploy frontend (Vercel/Netlify) and backend (Render/Railway) with CORS configured
- Add a language distribution chart across repositories
- Debounced search-as-you-type
- Environment-based API URL for production frontend builds

## AI / Tools Used

Built with Cursor AI assistance. All code has been reviewed and understood.
