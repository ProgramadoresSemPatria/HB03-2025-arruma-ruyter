import type { ProbotOctokit } from "probot";
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
export declare const listPullRequestFilenames: (octokit: ProbotOctokit, params: ListFilesParams) => Promise<string[]>;
export declare const listPullRequestFiles: (octokit: ProbotOctokit, params: ListFilesParams) => Promise<PullRequestFile[]>;
export declare const listPullRequestFilesWithContent: (octokit: ProbotOctokit, params: ListFilesParams & {
    ref: string;
}) => Promise<PullRequestFileWithContent[]>;
export type CreatePlaceholderPullRequestParams = {
    owner: string;
    repo: string;
    baseRef: string;
    baseSha: string;
    originalPrNumber: number;
    originalPrUrl: string;
};
export declare const openPlaceholderPullRequest: (octokit: ProbotOctokit, params: CreatePlaceholderPullRequestParams) => Promise<{
    branchName: string;
    commitSha: string;
    pullRequestUrl: string;
    pullRequestNumber: number;
}>;
export {};
