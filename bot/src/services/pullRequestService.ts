import type { ProbotOctokit } from "probot";
import { listPullRequestFilenames, listPullRequestFilesWithContent } from "../infra/github.js";
import type {
  PullRequestAnalysisInput,
  PullRequestFileForAnalysis,
  PullRequestSummary,
} from "../types/domain/pullRequest.js";

export type PullRequestSummaryInput = {
  octokit: ProbotOctokit;
  owner: string;
  repo: string;
  pullNumber: number;
  title: string;
};

export const getPullRequestSummary = async (input: PullRequestSummaryInput): Promise<PullRequestSummary> => {
  const { octokit, owner, repo, pullNumber, title } = input;
  const filenames = await listPullRequestFilenames(octokit, { owner, repo, pullNumber });

  return {
    repo: `${owner}/${repo}`,
    number: pullNumber,
    title,
    filenames,
  };
};

export type PullRequestAnalysisInputParams = {
  octokit: ProbotOctokit;
  owner: string;
  repo: string;
  pullNumber: number;
  title: string;
  baseRef: string;
  headRef: string;
  headSha?: string;
};

export const buildPullRequestAnalysisInput = async (
  params: PullRequestAnalysisInputParams
): Promise<PullRequestAnalysisInput> => {
  const { octokit, owner, repo, pullNumber, title, baseRef, headRef, headSha } = params;
  const ref = headSha || headRef;

  const filesWithContent = await listPullRequestFilesWithContent(octokit, {
    owner,
    repo,
    pullNumber,
    ref,
  });

  const files: PullRequestFileForAnalysis[] = filesWithContent.map((file) => ({
    filename: file.filename,
    status: file.status,
    additions: file.additions,
    deletions: file.deletions,
    patch: file.patch,
    content: file.content,
  }));

  return {
    repo: `${owner}/${repo}`,
    number: pullNumber,
    title,
    baseRef,
    headRef,
    headSha,
    files,
  };
};
