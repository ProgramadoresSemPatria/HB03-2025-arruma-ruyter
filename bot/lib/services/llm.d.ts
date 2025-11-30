import type { PullRequestAnalysisInput } from "../types/domain/pullRequest.js";
export type LlmPatch = {
    filename: string;
    patchedContent: string;
    rationale?: string;
};
export type LlmAnalysisResult = {
    title: string;
    comment: string;
    patches: LlmPatch[];
    prompt: string;
};
export declare const buildGeminiPrompt: (input: PullRequestAnalysisInput) => string;
export declare const analyzePullRequestWithLLM: (input: PullRequestAnalysisInput) => Promise<LlmAnalysisResult>;
