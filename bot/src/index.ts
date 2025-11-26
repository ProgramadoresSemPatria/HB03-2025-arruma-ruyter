import { Probot } from "probot";
import { registerPullRequestHandlers } from "./handlers/pullRequestHandlers.js";

export default (app: Probot) => {
  registerPullRequestHandlers(app);
};
