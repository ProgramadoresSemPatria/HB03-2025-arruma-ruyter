import type { ProbotOctokit } from "probot";
import { listPullRequestFilenames } from "../infra/github.js";
import type { PullRequestSummary } from "../types/domain/pullRequest.js";

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
