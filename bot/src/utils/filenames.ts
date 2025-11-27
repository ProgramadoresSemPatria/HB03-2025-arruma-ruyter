import type { PullRequestFile } from "../types/infra/github/pullRequest.js";

export const extractFilenames = (files: PullRequestFile[]): string[] => files.map((file) => file.filename);
