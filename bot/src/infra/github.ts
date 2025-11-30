import { extractFilenames } from "../utils/filenames.js";

/* ---------------------------------------------
 * TYPES
 * --------------------------------------------- */

export interface PullRequestFile {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  patch?: string;
  content?: string | null;
}

export interface OpenAutoFixParams {
  owner: string;
  repo: string;
  baseRef: string;
  baseSha: string;
  originalPrNumber: number;
  originalPrUrl: string;
  patches: { filename: string; patchedContent: string }[];
  prTitle?: string | null;
  prBody?: string | null;
}

/* ---------------------------------------------
 * LIST FILE NAMES ONLY
 * --------------------------------------------- */

export const listPullRequestFilenames = async (
  octokit: any,
  params: { owner: string; repo: string; pullNumber: number }
): Promise<string[]> => {
  const { owner, repo, pullNumber } = params;

  const filesResponse = await octokit.pulls.listFiles({
    owner,
    repo,
    pull_number: pullNumber,
  });

  return extractFilenames(filesResponse.data as any);
};

/* ---------------------------------------------
 * LIST PR FILES (WITHOUT CONTENT)
 * --------------------------------------------- */

export const listPullRequestFiles = async (
  octokit: any,
  params: { owner: string; repo: string; pullNumber: number }
) => {
  const { owner, repo, pullNumber } = params;

  const filesResponse = await octokit.pulls.listFiles({
    owner,
    repo,
    pull_number: pullNumber,
  });

  return filesResponse.data;
};

/* ---------------------------------------------
 * READ RAW CONTENT OF A FILE
 * --------------------------------------------- */

const fetchFileContent = async (
  octokit: any,
  params: { owner: string; repo: string; path: string; ref: string }
): Promise<string | null> => {
  const contentResponse = await octokit.repos.getContent({
    owner: params.owner,
    repo: params.repo,
    path: params.path,
    ref: params.ref,
  });

  if (Array.isArray(contentResponse.data)) return null;

  if (
    contentResponse.data.type !== "file" ||
    !("content" in contentResponse.data)
  ) {
    return null;
  }

  try {
    return Buffer.from(
      contentResponse.data.content,
      contentResponse.data.encoding as BufferEncoding
    ).toString("utf-8");
  } catch {
    return null;
  }
};

/* ---------------------------------------------
 * LIST PR FILES WITH FULL CONTENT
 * --------------------------------------------- */

export const listPullRequestFilesWithContent = async (
  octokit: any,
  params: {
    owner: string;
    repo: string;
    pullNumber: number;
    ref: string;
  }
): Promise<PullRequestFile[]> => {
  const { owner, repo, pullNumber, ref } = params;

  const files = await listPullRequestFiles(octokit, {
    owner,
    repo,
    pullNumber,
  });

  const filesWithContent = await Promise.all(
    files.map(async (file: any): Promise<PullRequestFile> => {
      const shouldFetch = file.status !== "removed" && !!file.filename;

      const content = shouldFetch
        ? await fetchFileContent(octokit, {
            owner,
            repo,
            path: file.filename,
            ref,
          })
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

/* ---------------------------------------------
 * GIT: CREATE BRANCH
 * --------------------------------------------- */

const createBranchFromSha = async (
  octokit: any,
  params: { owner: string; repo: string; branchName: string; sha: string }
) => {
  await octokit.git.createRef({
    owner: params.owner,
    repo: params.repo,
    ref: `refs/heads/${params.branchName}`,
    sha: params.sha,
  });
};

/* ---------------------------------------------
 * GIT: COMMIT CHANGES
 * --------------------------------------------- */

const commitChanges = async (
  octokit: any,
  params: {
    owner: string;
    repo: string;
    baseSha: string;
    branchName: string;
    commitMessage: string;
    changes: { path: string; content: string; mode?: string }[];
  }
): Promise<string> => {
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
    mode: "100644",
    type: "blob",
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

/* ---------------------------------------------
 * PLACEHOLDER PR
 * --------------------------------------------- */

export const openPlaceholderPullRequest = async (
  octokit: any,
  params: {
    owner: string;
    repo: string;
    baseRef: string;
    baseSha: string;
    originalPrNumber: number;
    originalPrUrl: string;
  }
) => {
  const { owner, repo, baseRef, baseSha, originalPrNumber, originalPrUrl } =
    params;

  const branchName = `auto-fix/pr-${originalPrNumber}-${Date.now()}`;

  await createBranchFromSha(octokit, { owner, repo, branchName, sha: baseSha });

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
      "PR automático placeholder para encadear o fluxo do bot.",
      `Referência: PR original #${originalPrNumber}`,
    ].join("\n\n"),
  });

  return {
    branchName,
    commitSha,
    pullRequestUrl: pull.data.html_url,
    pullRequestNumber: pull.data.number,
  };
};

/* ---------------------------------------------
 * REAL AUTO-FIX PR
 * --------------------------------------------- */

export const openAutoFixPullRequest = async (
  octokit: any,
  params: OpenAutoFixParams
) => {
  const {
    owner,
    repo,
    baseRef,
    baseSha,
    originalPrNumber,
    originalPrUrl,
    patches,
    prTitle,
    prBody,
  } = params;

  const branchName = `auto-fix/pr-${originalPrNumber}-${Date.now()}`;

  await createBranchFromSha(octokit, { owner, repo, branchName, sha: baseSha });

  const changes = patches.map((patch) => ({
    path: patch.filename,
    content: patch.patchedContent,
    mode: "100644" as const,
  }));

  const commitSha = await commitChanges(octokit, {
    owner,
    repo,
    baseSha,
    branchName,
    commitMessage: `chore: auto-fix for PR #${originalPrNumber}`,
    changes,
  });

  const body =
    prBody ||
    [
      "Correções automáticas de segurança.",
      `Referência: PR original #${originalPrNumber}`,
      `Resumo: ${patches.length} arquivo(s) ajustado(s).`,
    ].join("\n\n");

  const pull = await octokit.pulls.create({
    owner,
    repo,
    head: branchName,
    base: baseRef,
    title: prTitle ?? "#PR_corrigido",
    body,
  });

  return {
    branchName,
    commitSha,
    pullRequestUrl: pull.data.html_url,
    pullRequestNumber: pull.data.number,
  };
};
