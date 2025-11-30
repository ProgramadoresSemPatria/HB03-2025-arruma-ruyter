import type { ProbotOctokit } from "probot";
import type { PullRequestAnalysisInput, PullRequestSummary } from "../types/domain/pullRequest.js";
export type PullRequestSummaryInput = {
    octokit: ProbotOctokit;
    owner: string;
    repo: string;
    pullNumber: number;
    title: string;
};
export declare const getPullRequestSummary: (input: PullRequestSummaryInput) => Promise<PullRequestSummary>;
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
export declare const buildPullRequestAnalysisInput: (params: PullRequestAnalysisInputParams) => Promise<PullRequestAnalysisInput>;
