import type { PullRequestAnalysisInput } from "../types/domain/pullRequest.js";

export type LlmPatch = {
  filename: string;
  patchedContent: string;
  rationale?: string;
};

export type LlmAnalysisResult = {
  title: string;
  comment: string;
  patches: LlmPatch[];
  prompt: string;
};

export const buildGeminiPrompt = (input: PullRequestAnalysisInput): string => {
  const header = [
    "Voce e um revisor de seguranca. Analise o PR e produza correcoes para SQL Injection.",
    "Responda em JSON com campos: title, comment, patches[].",
    "Use title '#PR_corrigido'. O comment deve incluir explicacao sucinta do SQLi e link (bot insere).",
    "Cada patch deve conter filename e patchedContent (arquivo completo corrigido).",
  ].join("\n");

  const filesSection = input.files
    .map((file) => {
      const meta = `# ${file.filename} (${file.status}) additions:${file.additions} deletions:${file.deletions}`;
      const patchBlock = file.patch ? `\nPATCH:\n${file.patch}` : "";
      const contentBlock = file.content ? `\nCONTENT:\n${file.content}` : "\nCONTENT: <not fetched>";
      return `${meta}${patchBlock}${contentBlock}`;
    })
    .join("\n\n");

  return [
    header,
    `Repo: ${input.repo}`,
    `Base: ${input.baseRef}`,
    `Head: ${input.headRef}`,
    `PR: #${input.number} - ${input.title}`,
    filesSection,
  ].join("\n\n");
};

export const analyzePullRequestWithLLM = async (
  input: PullRequestAnalysisInput
): Promise<LlmAnalysisResult> => {
  const prompt = buildGeminiPrompt(input);

  // Stub: aqui voltamos um resultado fixo para nao depender do LLM real ainda.
  return {
    title: "#PR_corrigido",
    comment: [
      "Abri um PR com correcoes de vulnerabilidades (link sera inserido pelo bot) #PR_corrigido",
      "Motivo: SQL injection detectado; use consultas parametrizadas e sanitize entradas.",
    ].join("\n"),
    patches: input.files.slice(0, 1).map((file) => ({
      filename: file.filename,
      patchedContent: file.content ?? "",
      rationale: "Stub: devolveremos o conteudo original ate integrar com o LLM.",
    })),
    prompt,
  };
};
