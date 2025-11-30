// src/domain/pullRequest.ts

export interface PullRequestFile {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  patch?: string | null;
  content?: string | null;
}
