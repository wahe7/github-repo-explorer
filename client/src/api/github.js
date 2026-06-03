const API_BASE = '/api';

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || 'Request failed');
    error.code = data.code || 'UNKNOWN_ERROR';
    error.status = response.status;
    throw error;
  }

  return data;
}

function parseNdjsonLines(buffer, onLine) {
  const lines = buffer.split('\n');
  const remainder = lines.pop() ?? '';

  for (const line of lines) {
    if (!line.trim()) continue;
    onLine(JSON.parse(line));
  }

  return remainder;
}

export function fetchUser(username) {
  return fetch(`${API_BASE}/users/${encodeURIComponent(username)}`).then(handleResponse);
}

export function fetchRepos(username, { page = 1, sort = 'updated', order = 'desc' } = {}) {
  const params = new URLSearchParams({ page: String(page), sort, order });
  return fetch(
    `${API_BASE}/users/${encodeURIComponent(username)}/repos?${params.toString()}`
  ).then(handleResponse);
}

export async function fetchReposStream(
  username,
  { sort = 'updated', order = 'desc' } = {},
  { onProgress, onPage, onDone } = {}
) {
  const params = new URLSearchParams({ sort, order });
  const response = await fetch(
    `${API_BASE}/users/${encodeURIComponent(username)}/repos/stream?${params.toString()}`
  );

  if (!response.ok) {
    return handleResponse(response);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    buffer = parseNdjsonLines(buffer, (data) => {
      if (data.type === 'progress') onProgress?.(data.fetched);
      if (data.type === 'page') onPage?.(data);
      if (data.type === 'done') onDone?.(data);
    });
  }

  if (buffer.trim()) {
    parseNdjsonLines(`${buffer}\n`, (data) => {
      if (data.type === 'progress') onProgress?.(data.fetched);
      if (data.type === 'page') onPage?.(data);
      if (data.type === 'done') onDone?.(data);
    });
  }
}

export function fetchRepoDetail(username, repoName) {
  return fetch(
    `${API_BASE}/users/${encodeURIComponent(username)}/repos/${encodeURIComponent(repoName)}`
  ).then(handleResponse);
}
