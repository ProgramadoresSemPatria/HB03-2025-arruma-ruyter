import { Probot } from "probot";
import { registerPullRequestHandlers } from "./handlers/pullRequestHandlers.js";

export default (app: Probot) => {

  console.log("⚡ Unvibe Bot iniciado!");

  registerPullRequestHandlers(app);

  app.on("issues.opened", async (context) => {
    const issueComment = context.issue({
      body: "Thanks for opening this issue!",
    });
    await context.octokit.issues.createComment(issueComment);
  });

  app.on("pull_request.opened", async (context) => {
    context.log.info("PR aberto - handler simples, mas o handler real é o registerPullRequestHandlers");
  });
};
