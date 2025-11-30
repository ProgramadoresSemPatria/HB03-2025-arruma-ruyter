import { openAutoFixPullRequest } from "../infra/github.js";
import { analyzePullRequestWithLLM } from "../services/llm.js";
import { getBotConfigByInstallation } from "../services/configService.js";
import { buildPullRequestAnalysisInput, getPullRequestSummary, } from "../services/pullRequestService.js";
export const registerPullRequestHandlers = (app) => {
    app.on(["pull_request.opened", "pull_request.synchronize"], async (context) => {
        const pr = context.payload.pull_request;
        const owner = context.repo().owner;
        const repo = context.repo().repo;
        const branchRef = pr.head?.ref ?? "";
        const installationId = context.payload.installation?.id;
        const isBotActor = (context.isBot ||
            pr.user?.type === "Bot" ||
            pr.user?.login?.endsWith?.("[bot]") ||
            pr.head?.user?.type === "Bot" ||
            pr.head?.user?.login?.endsWith?.("[bot]") ||
            pr.head?.repo?.owner?.type === "Bot" ||
            pr.head?.repo?.owner?.login?.endsWith?.("[bot]") ||
            context.payload.sender?.type === "Bot" ||
            context.payload.sender?.login?.endsWith?.("[bot]"));
        const isAutoFixBranch = (branchRef?.startsWith?.("auto-fix/") ||
            branchRef?.startsWith?.("auto-fixes/") ||
            branchRef?.includes?.("auto-fix/"));
        const isGeneratedFixPR = (pr.title?.includes?.("#PR_corrigido") ||
            pr.body?.includes?.("#PR_corrigido") ||
            pr.body?.includes?.("Placeholder auto-fix"));
        if (isBotActor || isAutoFixBranch || isGeneratedFixPR) {
            context.log.info({
                ref: branchRef,
                prUserType: pr.user?.type,
                prUser: pr.user?.login,
                headUserType: pr.head?.user?.type,
                headUser: pr.head?.user?.login,
                headOwnerType: pr.head?.repo?.owner?.type,
                headOwner: pr.head?.repo?.owner?.login,
                senderType: context.payload.sender?.type,
                sender: context.payload.sender?.login,
                reasons: {
                    isBotActor,
                    isAutoFixBranch,
                    isGeneratedFixPR,
                },
            }, "ignoring auto-generated/bot pull request");
            return;
        }
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

        let preferredModel = null;
        if (installationId) {
            try {
                const modelsFromConfig = await getBotConfigByInstallation(installationId);
                if (Array.isArray(modelsFromConfig) && modelsFromConfig.length > 0) {
                    preferredModel = modelsFromConfig[0];
                }
            }
            catch (error) {
                context.log.warn({ error }, "failed_to_load_model_from_config");
            }
        }

        const cleanComment = (text) => {
            if (!text) return text;
            const cleaned = text
                .replace(/link\s+para\s+o\s+pr:\s*\[bot insere\]/gi, "")
                .replace(/\[bot insere\]/gi, "")
                .replace(/\(bot insere\)/gi, "")
                .replace(/\[link[^\]]*\(bot insere\)\]/gi, "")
                .replace(/\[link-do-pr-aqui\]/gi, "")
                .replace(/\[.*?bot\s+insere.*?\]/gi, "")
                .replace(/\[.*?link-do-pr.*?\]/gi, "")
                .replace(/\[\s*link\s*para\s*o\s*pr\s*\]/gi, "")
                .replace(/\[\s*link\s*para\s*pr\s*\]/gi, "")
                .replace(/\[link\s+para\s+o\s+pr.*?\]/gi, "")
                .replace(/\[link.*?\]/gi, "");
            return cleaned.trim().replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n");
        };

        let llmResult;
        try {
            llmResult = await analyzePullRequestWithLLM(analysisInput, preferredModel);
        }
        catch (error) {
            const message = error?.message || "Falha ao chamar LLM";
            context.log.error({ error: message }, "llm_analysis_failed");
            await context.octokit.issues.createComment({
                owner,
                repo,
                issue_number: pr.number,
                body: `Nao foi possivel analisar o PR automaticamente: ${message}`,
            });
            return;
        }

        const patches = Array.isArray(llmResult?.patches)
            ? llmResult.patches.filter((p) => !!p?.filename && typeof p?.patchedContent === "string")
            : [];
        const hasPatches = patches.length > 0;
        const modelUsed = llmResult?.modelUsed || preferredModel || "desconhecido";

        try {
            if (!hasPatches) {
                const noVulnComment = [
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
                    body: noVulnComment,
                });
                context.log.info({ summary, llmResult }, "pull_request_no_vulnerabilities");
                return;
            }

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

            const originalComment = [
                `Abri um PR com correcoes de vulnerabilidades (${autoFix.pullRequestUrl}) #PR_corrigido`,
                llmResult?.comment ? `Resumo: ${cleanComment(llmResult.comment)}` : null,
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

            const autoFixComment = cleanComment(llmResult?.comment);

            if (autoFixComment) {
                const autoFixBody = [
                    autoFixComment,
                    `Modelo utilizado: ${modelUsed}`,
                ]
                    .filter(Boolean)
                    .join("\n\n");
                await context.octokit.issues.createComment({
                    owner,
                    repo,
                    issue_number: autoFix.pullRequestNumber,
                    body: autoFixBody,
                });
            }

            context.log.info({ summary, llmResult, autoFix }, "pull_request_auto_fix_created");
        }
        catch (error) {
            context.log.error({ error }, "auto_fix_failed");
        }
        context.log.info({ summary, llmResult }, "pull_request_analysis_completed");
    });
};
//# sourceMappingURL=pullRequestHandlers.js.map
