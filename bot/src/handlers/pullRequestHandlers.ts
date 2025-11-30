import { Probot } from "probot";
import { openAutoFixPullRequest } from "../infra/github.js";
import { analyzePullRequestWithLLM } from "../services/llm.js";
import { getBotConfigByInstallation } from "../services/configService.js";
import {
  buildPullRequestAnalysisInput,
  getPullRequestSummary,
} from "../services/pullRequestService.js";

export function registerPullRequestHandlers(app: Probot) {
  app.on(
    ["pull_request.opened", "pull_request.synchronize"],
    async (context) => {
      const pr = context.payload.pull_request;
      const { owner, repo } = context.repo();
      const branchRef = pr.head?.ref ?? "";
      const installationId = context.payload.installation?.id;

      /** -----------------------------
       *  BOT / AUTO-FIX FILTERS
       * ----------------------------- */
      const isBotActor =
        context.isBot ||
        pr.user?.type === "Bot" ||
        pr.user?.login?.endsWith?.("[bot]") ||
        pr.head?.user?.type === "Bot" ||
        pr.head?.user?.login?.endsWith?.("[bot]") ||
        pr.head?.repo?.owner?.type === "Bot" ||
        pr.head?.repo?.owner?.login?.endsWith?.("[bot]") ||
        context.payload.sender?.type === "Bot" ||
        context.payload.sender?.login?.endsWith?.("[bot]");

      const isAutoFixBranch =
        branchRef?.startsWith?.("auto-fix/") ||
        branchRef?.startsWith?.("auto-fixes/") ||
        branchRef?.includes?.("auto-fix/");

      const isGeneratedFixPR =
        pr.title?.includes?.("#PR_corrigido") ||
        pr.body?.includes?.("#PR_corrigido") ||
        pr.body?.includes?.("Placeholder auto-fix");

      if (isBotActor || isAutoFixBranch || isGeneratedFixPR) {
        context.log.info(
          {
            ref: branchRef,
            sender: context.payload.sender?.login,
            reasons: {
              isBotActor,
              isAutoFixBranch,
              isGeneratedFixPR,
            },
          },
          "ignoring auto-generated/bot pull request"
        );
        return;
      }

      /** -----------------------------
       *  SUMMARY + ANALYSIS INPUT
       * ----------------------------- */
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

      /** -----------------------------
       *  MODEL SELECTION (from DB)
       * ----------------------------- */
      let preferredModel: string | null = null;

      if (installationId) {
        try {
          const models = await getBotConfigByInstallation(installationId);
          if (Array.isArray(models) && models.length > 0) {
            preferredModel = models[0];
          }
        } catch (error) {
          context.log.warn({ error }, "failed_to_load_model_from_config");
        }
      }

      const cleanComment = (text?: string | null) => {
        if (!text) return text;

        return text
          .replace(/link\s+para\s+o\s+pr:\s*\[bot insere\]/gi, "")
          .replace(/\[bot insere\]/gi, "")
          .replace(/\(bot insere\)/gi, "")
          .replace(/\[link[^\]]*\]/gi, "")
          .replace(/\[.*?bot\s+insere.*?\]/gi, "")
          .replace(/\[.*?link-do-pr.*?\]/gi, "")
          .replace(/\[link.*?\]/gi, "")
          .trim()
          .replace(/\s+\n/g, "\n")
          .replace(/\n{3,}/g, "\n\n");
      };

      /** -----------------------------
       *  CALL LLM
       * ----------------------------- */
      let llmResult: any;

      try {
        llmResult = await analyzePullRequestWithLLM(
          analysisInput,
          preferredModel
        );
      } catch (error: any) {
        const message = error?.message || "Falha ao chamar LLM";
        context.log.error({ error: message }, "llm_analysis_failed");

        await context.octokit.issues.createComment({
          owner,
          repo,
          issue_number: pr.number,
          body: `Não foi possível analisar o PR automaticamente: ${message}`,
        });
        return;
      }

      const patches = Array.isArray(llmResult?.patches)
        ? llmResult.patches.filter(
            (p: any) =>
              !!p?.filename && typeof p?.patchedContent === "string"
          )
        : [];

      const hasPatches = patches.length > 0;
      const modelUsed = llmResult?.modelUsed || preferredModel || "desconhecido";

      /** -----------------------------
       *  IF NO PATCHES: COMMENT ONLY
       * ----------------------------- */
      if (!hasPatches) {
        const comment = [
          cleanComment(llmResult?.comment) ||
            "Nenhuma vulnerabilidade encontrada pelo bot.",
          `Modelo utilizado: ${modelUsed}`,
        ]
          .filter(Boolean)
          .join("\n\n");

        await context.octokit.issues.createComment({
          owner,
          repo,
          issue_number: pr.number,
          body: comment,
        });

        context.log.info(
          { summary, llmResult },
          "pull_request_no_vulnerabilities"
        );
        return;
      }

      /** -----------------------------
       *  GENERATE AUTO-FIX PR
       * ----------------------------- */
      try {
        const autoFix = await openAutoFixPullRequest(context.octokit, {
          owner,
          repo,
          baseRef: pr.base.ref,
          baseSha: pr.head.sha,
          originalPrNumber: pr.number,
          originalPrUrl: pr.html_url,
          patches,
          prTitle: llmResult?.title,
          prBody: cleanComment(llmResult?.comment),
        });

        /** Comment in original PR */
        const originalComment = [
          `Abri um PR com correções de vulnerabilidades (${autoFix.pullRequestUrl}) #PR_corrigido`,
          llmResult?.comment
            ? `Resumo: ${cleanComment(llmResult.comment)}`
            : null,
          `Modelo utilizado: ${modelUsed}`,
        ]
          .filter(Boolean)
          .join("\n\n");

        await context.octokit.issues.createComment({
          owner,
          repo,
          issue_number: pr.number,
          body: originalComment,
        });

        /** Comment in auto-fix PR */
        const autoFixComment = cleanComment(llmResult?.comment);
        if (autoFixComment) {
          await context.octokit.issues.createComment({
            owner,
            repo,
            issue_number: autoFix.pullRequestNumber,
            body: `${autoFixComment}\n\nModelo utilizado: ${modelUsed}`,
          });
        }

        context.log.info(
          { summary, llmResult, autoFix },
          "pull_request_auto_fix_created"
        );
      } catch (error) {
        context.log.error({ error }, "auto_fix_failed");
      }

      context.log.info(
        { summary, llmResult },
        "pull_request_analysis_completed"
      );
    }
  );
}
