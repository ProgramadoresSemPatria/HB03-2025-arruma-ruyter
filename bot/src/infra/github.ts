import type { ProbotOctokit } from "probot";
import { extractFilenames } from "../utils/filenames.js";
import type { PullRequestFile } from "../types/infra/github/pullRequest.js";

export type FileChange = {
  path: string;
  content: string;
  mode?: "100644" | "100755";
};

export type PullRequestFileWithContent = {
  filename: string;
  status: PullRequestFile["status"];
  additions: number;
  deletions: number;
  patch?: string;
  content?: string | null;
};

type ListFilesParams = {
  owner: string;
  repo: string;
  pullNumber: number;
};

export const listPullRequestFilenames = async (
  octokit: ProbotOctokit,
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

export const listPullRequestFiles = async (
  octokit: ProbotOctokit,
  params: ListFilesParams
): Promise<PullRequestFile[]> => {
  const { owner, repo, pullNumber } = params;

  const filesResponse = await octokit.pulls.listFiles({
    owner,
    repo,
    pull_number: pullNumber,
  });

  return filesResponse.data as PullRequestFile[];
};

type FileContentParams = {
  owner: string;
  repo: string;
  path: string;
  ref: string;
};

const fetchFileContent = async (
  octokit: ProbotOctokit,
  params: FileContentParams
): Promise<string | null> => {
  const contentResponse = await octokit.repos.getContent({
    owner: params.owner,
    repo: params.repo,
    path: params.path,
    ref: params.ref,
  });

  if (Array.isArray(contentResponse.data)) {
    return null;
  }

  if (contentResponse.data.type !== "file" || !("content" in contentResponse.data)) {
    return null;
  }

  try {
    return Buffer.from(contentResponse.data.content, contentResponse.data.encoding as BufferEncoding).toString("utf-8");
  } catch {
    return null;
  }
};

export const listPullRequestFilesWithContent = async (
  octokit: ProbotOctokit,
  params: ListFilesParams & { ref: string }
): Promise<PullRequestFileWithContent[]> => {
  const { owner, repo, pullNumber, ref } = params;
  const files = await listPullRequestFiles(octokit, { owner, repo, pullNumber });

  const filesWithContent = await Promise.all(
    files.map(async (file): Promise<PullRequestFileWithContent> => {
      const shouldFetchContent = file.status !== "removed" && !!file.filename;
      const content = shouldFetchContent
        ? await fetchFileContent(octokit, { owner, repo, path: file.filename, ref })
        : null;

      return {
        filename: file.filename,
        status: file.status,
        additions: file.additions,
        deletions: file.deletions,
        patch: file.patch,
        content,
      };
    })
  );

  return filesWithContent;
};

type CreateBranchParams = {
  owner: string;
  repo: string;
  branchName: string;
  sha: string;
};

const createBranchFromSha = async (octokit: ProbotOctokit, params: CreateBranchParams) => {
  await octokit.git.createRef({
    owner: params.owner,
    repo: params.repo,
    ref: `refs/heads/${params.branchName}`,
    sha: params.sha,
  });
};

type CommitChangesParams = {
  owner: string;
  repo: string;
  baseSha: string;
  branchName: string;
  commitMessage: string;
  changes: FileChange[];
};

const commitChanges = async (octokit: ProbotOctokit, params: CommitChangesParams) => {
  const { owner, repo, baseSha, branchName, commitMessage, changes } = params;

  const baseCommit = await octokit.git.getCommit({
    owner,
    repo,
    commit_sha: baseSha,
  });

  const blobs = await Promise.all(
    changes.map(async (change) => {
      const blob = await octokit.git.createBlob({
        owner,
        repo,
        content: change.content,
        encoding: "utf-8",
      });
      return { change, sha: blob.data.sha };
    })
  );

  const tree = blobs.map((item) => ({
    path: item.change.path,
    mode: item.change.mode ?? "100644",
    type: "blob" as const,
    sha: item.sha,
  }));

  const newTree = await octokit.git.createTree({
    owner,
    repo,
    base_tree: baseCommit.data.tree.sha,
    tree,
  });

  const newCommit = await octokit.git.createCommit({
    owner,
    repo,
    message: commitMessage,
    tree: newTree.data.sha,
    parents: [baseSha],
  });

  await octokit.git.updateRef({
    owner,
    repo,
    ref: `heads/${branchName}`,
    sha: newCommit.data.sha,
    force: true,
  });

  return newCommit.data.sha;
};

export type CreatePlaceholderPullRequestParams = {
  owner: string;
  repo: string;
  baseRef: string;
  baseSha: string;
  originalPrNumber: number;
  originalPrUrl: string;
};

export const openPlaceholderPullRequest = async (
  octokit: ProbotOctokit,
  params: CreatePlaceholderPullRequestParams
) => {
  const { owner, repo, baseRef, baseSha, originalPrNumber, originalPrUrl } = params;
  const branchName = `auto-fix/pr-${originalPrNumber}-${Date.now()}`;

  await createBranchFromSha(octokit, {
    owner,
    repo,
    branchName,
    sha: baseSha,
  });

  const placeholderPath = `auto-fixes/pr-${originalPrNumber}-placeholder.md`;
  const commitSha = await commitChanges(octokit, {
    owner,
    repo,
    baseSha,
    branchName,
    commitMessage: `chore: placeholder auto-fix for PR #${originalPrNumber}`,
    changes: [
      {
        path: placeholderPath,
        content: [
          `Placeholder auto-fix for PR #${originalPrNumber}`,
          `Original PR: ${originalPrUrl}`,
          "",
          "This commit was generated automatically and should be replaced by the real fix.",
        ].join("\n"),
      },
    ],
  });

  const pull = await octokit.pulls.create({
    owner,
    repo,
    head: branchName,
    base: baseRef,
    title: "#PR_corrigido",
    body: [
      "PR automatico placeholder para encadear o fluxo do bot.",
      `Referencia: PR original #${originalPrNumber}`,
    ].join("\n\n"),
  });

  return {
    branchName,
    commitSha,
    pullRequestUrl: pull.data.html_url,
    pullRequestNumber: pull.data.number,
  };
};
