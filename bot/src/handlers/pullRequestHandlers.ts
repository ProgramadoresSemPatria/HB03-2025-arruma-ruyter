import type { Context, Probot } from "probot";
import { openPlaceholderPullRequest } from "../infra/github.js";
import { analyzePullRequestWithLLM } from "../services/llm.js";
import {
  buildPullRequestAnalysisInput,
  getPullRequestSummary,
} from "../services/pullRequestService.js";

type PullRequestEvents = "pull_request.opened" | "pull_request.synchronize";

export const registerPullRequestHandlers = (app: Probot) => {
  app.on(["pull_request.opened", "pull_request.synchronize"], async (context: Context<PullRequestEvents>) => {
    const pr = context.payload.pull_request;
    const owner = context.repo().owner;
    const repo = context.repo().repo;

    const summary = await getPullRequestSummary({
      octokit: context.octokit,
      owner,
      repo,
      pullNumber: pr.number,
      title: pr.title,
    });

    const analysisInput = await buildPullRequestAnalysisInput({
      octokit: context.octokit,
      owner,
      repo,
      pullNumber: pr.number,
      title: pr.title,
      baseRef: pr.base.ref,
      headRef: pr.head.ref,
      headSha: pr.head.sha,
    });

    const llmResult = await analyzePullRequestWithLLM(analysisInput);

    let placeholder;
    try {
      placeholder = await openPlaceholderPullRequest(context.octokit, {
        owner,
        repo,
        baseRef: pr.base.ref,
        baseSha: pr.base.sha,
        originalPrNumber: pr.number,
        originalPrUrl: pr.html_url,
      });

      const commentBody = [
        `Abri um PR com correcoes de vulnerabilidades (${placeholder.pullRequestUrl}) #PR_corrigido`,
        "Comentario placeholder enquanto a LLM nao aplica patches reais.",
      ].join("\n");

      await context.octokit.issues.createComment({
        owner,
        repo,
        issue_number: pr.number,
        body: commentBody,
      });
    } catch (error) {
      context.log.error({ error }, "auto_fix_placeholder_failed");
    }

    context.log.info({ summary, llmResult, placeholder }, "pull_request_analysis_stub");
  });
};
