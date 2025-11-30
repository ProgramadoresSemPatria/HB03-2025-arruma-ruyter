export type PullRequestSummary = {
    repo: string;
    number: number;
    title: string;
    filenames: string[];
};
export type PullRequestFileForAnalysis = {
    filename: string;
    status: string;
    additions: number;
    deletions: number;
    patch?: string;
    content?: string | null;
};
export type PullRequestAnalysisInput = {
    repo: string;
    number: number;
    title: string;
    baseRef: string;
    headRef: string;
    headSha?: string;
    files: PullRequestFileForAnalysis[];
};
