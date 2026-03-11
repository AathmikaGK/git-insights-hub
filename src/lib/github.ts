const BASE = "https://api.github.com";

export interface RepoInfo {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  watchers_count: number;
  language: string | null;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  size: number;
  default_branch: string;
  topics: string[];
  license: { name: string } | null;
  owner: {
    login: string;
    avatar_url: string;
  };
}

export interface Contributor {
  login: string;
  avatar_url: string;
  contributions: number;
  html_url: string;
}

export interface CommitActivity {
  week: number;
  total: number;
  days: number[];
}

export interface LanguageBreakdown {
  [language: string]: number;
}

export interface CommitItem {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  author: {
    login: string;
    avatar_url: string;
  } | null;
}

export function parseRepoUrl(input: string): { owner: string; repo: string } | null {
  const cleaned = input.trim().replace(/\/+$/, "");

  // Handle full GitHub URLs
  const urlMatch = cleaned.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (urlMatch) return { owner: urlMatch[1], repo: urlMatch[2].replace(/\.git$/, "") };

  // Handle owner/repo format
  const slashMatch = cleaned.match(/^([^/]+)\/([^/]+)$/);
  if (slashMatch) return { owner: slashMatch[1], repo: slashMatch[2] };

  return null;
}

async function ghFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Accept: "application/vnd.github.v3+json" },
  });
  if (!res.ok) {
    if (res.status === 404) throw new Error("Repository not found");
    if (res.status === 403) throw new Error("API rate limit exceeded. Try again later.");
    throw new Error(`GitHub API error: ${res.status}`);
  }
  return res.json();
}

export async function fetchRepoInfo(owner: string, repo: string): Promise<RepoInfo> {
  return ghFetch<RepoInfo>(`/repos/${owner}/${repo}`);
}

export async function fetchContributors(owner: string, repo: string): Promise<Contributor[]> {
  return ghFetch<Contributor[]>(`/repos/${owner}/${repo}/contributors?per_page=20`);
}

export async function fetchCommitActivity(owner: string, repo: string): Promise<CommitActivity[]> {
  return ghFetch<CommitActivity[]>(`/repos/${owner}/${repo}/stats/commit_activity`);
}

export async function fetchLanguages(owner: string, repo: string): Promise<LanguageBreakdown> {
  return ghFetch<LanguageBreakdown>(`/repos/${owner}/${repo}/languages`);
}

export async function fetchRecentCommits(owner: string, repo: string): Promise<CommitItem[]> {
  return ghFetch<CommitItem[]>(`/repos/${owner}/${repo}/commits?per_page=30`);
}
