export interface HtmlHistory {
  html: string;
  createdAt: Date;
  prompt: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  html: string;
  prompts: string[];
  lastCommitSha?: string | null;
  lastSyncedAt?: string | null;
  defaultBranch?: string | null;
  repoHtmlUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CurrentUser {
  id: string;
  name?: string | null;
  login?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
}
