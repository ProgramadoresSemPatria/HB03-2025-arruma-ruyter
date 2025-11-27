import nock from "nock";
import myProbotApp from "../src/index.js";
import { Probot, ProbotOctokit } from "probot";
import { describe, beforeEach, afterEach, test, expect, vi } from "vitest";

const privateKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEogIBAAKCAQEAwUt4uKnXtzjrJc2Cm1hgcEw7XZ3huParMMrT4KGGiie+AF8Q
p9w8OA70zIuadJnu7pJ7OXMn126Qq4dCzTIE/P7HbtWlAneHJ6ETktuv+B4QrTiZ
Zs23Fn51kSXtG5TtMHDUBX8JCOAjIlm7RMVibeWDjpNSx1HW6Jsjawhy9DGMcaOi
zczxmKNoAdo4G7BCuxNlYxpzoChHkCmIIsX/5Ns1zwBtDU8vGq8oAWGHZO1TaMbv
db7arzSN1prTFJPlrWAD/VezCYgNPtrxwJvItNWQRVIdV/fN8pZY9xECJlhvCAnH
hAZzEoSW6gtIXx+6KtCrZz+3u4ukGbT0oUthPwIDAQABAoIBABEfC0FoIehjzUha
7L+v01L/HZ8MNgs5Ji67OItEI3OnU4ga45HKyza39G0NzI+ZdvWA2hNbpOLLM1tO
LteYH6L9OlMR73zJc5pKBT7T4MFcgGOniMb3X8lJSEakEl2IEn5g8BbQis9Tcyk+
w3yy8yYC12VQnVt0X1HZNAjuBaild33Zr+tS/orKYn2FeyaFKDGzhyBshWvcRst6
fcUKX43vYVuXZ85uehzenO+x9gy1gP+lXAbgEjhV7pe1rIoDC74G5OhjXfbDQWc5
UeAHaK96RzVthr4r2mdWma6AEUs+tctus1JVrWDFff5FsmU2aolLbsJMs/91CofK
mBRxjNECgYEA4t+5e1b4jX/BKApcKVSdybqVYfjVG/dTyA6RceJ9XYVI/1ePdxd8
GbrjYg8dTNu3BDfDI9PbtnOZAA1yZ6l++4FJk90XMWGYnS7se5NM7QXs97xLABov
li4azPqkNt6KvMwYwvtvq2JPxIHCxb340laBi9f//a4XReOSDU7/1xcCgYEA2hwo
9myww6CJ0TEh2/l2/Sz1C+20QrH42gKS30d3OL2NCkeacPZMEdS3ijiy162z1KGW
C5Ef/sYpsOe1Fl0IOYyBjz+BtveR8Eicsi58eFTFG/dKDOTDHvmUJ1h4+YcK57iX
EJI/NdSBnDgNNeZPF3hRagMUOyuHa3LmiVfHoBkCgYAiQDBaZIjlo9HfX6EGRFYF
7Hs87ToPHMmzPC/NB6pxgfvBQNDR4+PCZqqJVUrRHaKFqn11XTigVNdWYLFS4Q3g
nmYjQo+LzvYhVMIy7cwBRJG/3NddzpY8j/1P0M8V0YcUdaOPXDJBp3fvbL+g5ss3
xgOMvzFQdQXicTbNd428RQKBgGEmH9y7RvSr4hcKgmFfuW9FghSBGUSHzycT9GV9
iI3+Z/8HK7RbEED09Zecb5R/q1TvcEzQpGavz0wbuN4wLASuH9s1V0qu9RMI1LrM
1+YlI/Kz8AjUMFDwq9vmnWPPkbzqzGa2LW+FqwFxOfkjD2GN1v2YR3+fgN8MO8E7
FxCpAoGAdM0jgpVUI1X7lt3qrflHw2+hC9aVu8MZE2pL9armIW6Ef/TwQzRWdoVS
3wU8qUMBh8daNJhft5puklRwfp7er5VpjH4j8orywxnLNE//LQx/DyF9wTr2SrCU
HFy6EgxVWTzq4ralZNtm0yJ3mG6o3xY/hIswmhvZV9YVAIJykSU=
-----END RSA PRIVATE KEY-----`;

describe("Pull request handlers", () => {
  let probot: Probot;

  beforeEach(() => {
    nock.disableNetConnect();
    probot = new Probot({
      appId: 123,
      privateKey,
      Octokit: ProbotOctokit.defaults({
        retry: { enabled: false },
        throttle: { enabled: false },
      }),
    });
    probot.load(myProbotApp);
  });

  test("logs PR summary when a pull request is opened", async () => {
    const mock = nock("https://api.github.com")
      .post("/app/installations/2/access_tokens")
      .reply(200, { token: "test" })
      .get("/repos/octocat/hello-world/pulls/1/files")
      .reply(200, [{ filename: "README.md" }]);

    const payload = {
      action: "opened",
      installation: { id: 2 },
      repository: { owner: { login: "octocat" }, name: "hello-world" },
      pull_request: { number: 1, title: "Update docs" },
    };

    await probot.receive({ name: "pull_request", payload });

    expect(mock.pendingMocks()).toStrictEqual([]);
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });
});
