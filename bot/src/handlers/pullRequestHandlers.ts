import type { Context, Probot } from "probot";
import { getPullRequestSummary } from "../services/pullRequestService.js";

type PullRequestEvents = "pull_request.opened" | "pull_request.synchronize";

export const registerPullRequestHandlers = (app: Probot) => {
  app.on(["pull_request.opened", "pull_request.synchronize"], async (context: Context<PullRequestEvents>) => {
    const summary = await getPullRequestSummary({
      octokit: context.octokit,
      owner: context.repo().owner,
      repo: context.repo().repo,
      pullNumber: context.payload.pull_request.number,
      title: context.payload.pull_request.title,
    });

    context.log.info(summary);
  });
};
