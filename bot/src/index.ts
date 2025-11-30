import { Probot } from "probot";
import { getBotConfigByInstallation } from "./services/configService.js";

export default (app: Probot) => {

  app.on("issues.opened", async (context) => {
    const issueComment = context.issue({
      body: "Thanks for opening this issue!",
    });
    await context.octokit.issues.createComment(issueComment);
  });

  app.on("pull_request.opened", async (context) => {
    const pr = context.payload.pull_request;
    const branchRef = pr.head?.ref ?? "";

    const isBotActor =
      context.isBot ||
      pr.user?.type === "Bot" ||
      pr.user?.login?.endsWith("[bot]") ||
      pr.head?.user?.type === "Bot" ||
      pr.head?.user?.login?.endsWith("[bot]") ||
      pr.head?.repo?.owner?.type === "Bot" ||
      context.payload.sender?.type === "Bot" ||
      context.payload.sender?.login?.endsWith("[bot]");

    const isAutoFixBranch =
      branchRef.startsWith("auto-fix/") ||
      branchRef.startsWith("auto-fixes/") ||
      branchRef.includes("auto-fix/");

    const isGeneratedFixPR =
      pr.title?.includes("#PR_corrigido") ||
      pr.body?.includes("#PR_corrigido") ||
      pr.body?.includes("Placeholder auto-fix");

    if (isBotActor || isAutoFixBranch || isGeneratedFixPR) {
      context.log.info(
        {
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
        },

        "ignoring auto-generated/bot pull request"

      );

      return;
    }

    const installationId = context.payload.installation?.id;

    const modelsFromConfig = installationId
      ? await getBotConfigByInstallation(installationId)
      : [];

    const modelsToUse = modelsFromConfig.length > 0 ? modelsFromConfig : ["gpt-5.1"];

    context.log.info(
      {
        repo: context.repo(),
        installationId,
        modelsToUse,
      },
      "pull_request_received_with_models"
    );

    const pullRequestComment = context.issue({
      body: [
        "Thanks for opening this pull request!",
        `Modelos configurados para analise: ${modelsToUse.join(", ")}`,
      ].join("\n"),
    });
    
    await context.octokit.issues.createComment(pullRequestComment);
  });
};
