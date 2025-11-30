import {
  listPullRequestFilenames,
  listPullRequestFilesWithContent,
} from "../infra/github.js";

/* -----------------------------------------------------
 * TYPES
 * ----------------------------------------------------- */

export interface PullRequestSummary {
  repo: string;
  number: number;
  title: string;
  filenames: string[];
}

export interface PullRequestServiceInput {
  octokit: any;
  owner: string;
  repo: string;
  pullNumber: number;
  title: string;
}

export interface PullRequestAnalysisInput {
  repo: string;
  number: number;
  title: string;
  baseRef: string;
  headRef: string;
  headSha: string;
  files: {
    filename: string;
    status: string;
    additions: number;
    deletions: number;
    patch?: string | null;
    content?: string | null;
  }[];
}

/* -----------------------------------------------------
 * getPullRequestSummary
 * ----------------------------------------------------- */

export const getPullRequestSummary = async (
  input: PullRequestServiceInput
): Promise<PullRequestSummary> => {
  const { octokit, owner, repo, pullNumber, title } = input;

  const filenames = await listPullRequestFilenames(octokit, {
    owner,
    repo,
    pullNumber,
  });

  return {
    repo: `${owner}/${repo}`,
    number: pullNumber,
    title,
    filenames,
  };
};

/* -----------------------------------------------------
 * buildPullRequestAnalysisInput
 * ----------------------------------------------------- */

export interface BuildPullRequestAnalysisInputParams {
  octokit: any;
  owner: string;
  repo: string;
  pullNumber: number;
  title: string;
  baseRef: string;
  headRef: string;
  headSha: string;
}

export const buildPullRequestAnalysisInput = async (
  params: BuildPullRequestAnalysisInputParams
): Promise<PullRequestAnalysisInput> => {
  const {
    octokit,
    owner,
    repo,
    pullNumber,
    title,
    baseRef,
    headRef,
    headSha,
  } = params;

  // ref é head SHA quando disponível, senão usa o nome da branch
  const ref = headSha || headRef;

  const filesWithContent = await listPullRequestFilesWithContent(octokit, {
    owner,
    repo,
    pullNumber,
    ref,
  });

  const files = filesWithContent.map((file) => ({
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
