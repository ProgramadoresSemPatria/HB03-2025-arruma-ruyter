import type { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods";

export type PullRequestFile = RestEndpointMethodTypes["pulls"]["listFiles"]["response"]["data"][number];
