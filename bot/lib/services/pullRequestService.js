import { listPullRequestFilenames, listPullRequestFilesWithContent } from "../infra/github.js";
export const getPullRequestSummary = async (input) => {
    const { octokit, owner, repo, pullNumber, title } = input;
    const filenames = await listPullRequestFilenames(octokit, { owner, repo, pullNumber });
    return {
        repo: `${owner}/${repo}`,
        number: pullNumber,
        title,
        filenames,
    };
};
export const buildPullRequestAnalysisInput = async (params) => {
    const { octokit, owner, repo, pullNumber, title, baseRef, headRef, headSha } = params;
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
//# sourceMappingURL=pullRequestService.js.map