import type { Octokit } from "probot";
import { extractFilenames } from "../utils/filenames.js";
import type { PullRequestFile } from "../types/infra/github/pullRequest.js";

type ListFilesParams = {
  owner: string;
  repo: string;
  pullNumber: number;
};

export const listPullRequestFilenames = async (
  octokit: Octokit,
  params: ListFilesParams
): Promise<string[]> => {
  const { owner, repo, pullNumber } = params;

  const filesResponse = await octokit.pulls.listFiles({
    owner,
    repo,
    pull_number: pullNumber,
  });

  return extractFilenames(filesResponse.data as PullRequestFile[]);
};
