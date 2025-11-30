import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

/* ---------------------------------------------
 * ENV VARS
 * --------------------------------------------- */

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-pro";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

const ANTHROPIC_MODEL =
  process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20240620";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";

const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.1";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

/* ---------------------------------------------
 * CLIENTS
 * --------------------------------------------- */

const genAI = GEMINI_API_KEY
  ? new GoogleGenerativeAI(GEMINI_API_KEY)
  : null;

const anthropic = ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: ANTHROPIC_API_KEY })
  : null;

const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

/* ---------------------------------------------
 * TYPES
 * --------------------------------------------- */

export interface PullRequestAnalysisFile {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  patch?: string;
  content?: string | null;
}

export interface PullRequestAnalysisInput {
  repo: string;
  number: number;
  title: string;
  baseRef: string;
  headRef: string;
  headSha: string;
  files: PullRequestAnalysisFile[];
}

export interface LLMResult {
  title?: string;
  comment?: string;
  patches?: {
    filename: string;
    patchedContent: string;
  }[];
  modelUsed?: string;
  prompt?: string;
}

/* ---------------------------------------------
 * BUILD PROMPT FOR GEMINI (PRIMARY FORMAT)
 * --------------------------------------------- */

export const buildGeminiPrompt = (input: PullRequestAnalysisInput): string => {
  const header = [
    "Você é um revisor de segurança de código. Analise o PR e produza correções para vulnerabilidades encontradas (injeção, XSS, auth, autorização, RCE, secrets, etc.).",
    "Responda APENAS EM JSON com os campos: title, comment, patches[].",
    "Use title '#PR_corrigido'.",
    "comment deve explicar as vulnerabilidades encontradas. Não inclua links nem placeholders.",
    "patches[].patchedContent deve conter o ARQUIVO COMPLETO corrigido.",
    "Se não houver vulnerabilidades, retorne patches: [] e um comment curto.",
  ].join("\n");

  const filesSection = input.files
    .map((file) => {
      const meta = `# ${file.filename} (${file.status}) additions:${file.additions} deletions:${file.deletions}`;

      const patchBlock = file.patch ? `\nPATCH:\n${file.patch}` : "";
      const contentBlock = file.content
        ? `\nCONTENT:\n${file.content}`
        : "\nCONTENT: <not fetched>";

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

/* ---------------------------------------------
 * HELPERS
 * --------------------------------------------- */

const parseJsonStrict = (text: string): any => {
  try {
    return JSON.parse(text);
  } catch (e: any) {
    throw new Error(`LLM JSON parse failed: ${e}. Raw: ${text}`);
  }
};

/* ---------------------------------------------
 * GEMINI EXECUTION
 * --------------------------------------------- */

const runWithGemini = async (
  prompt: string
): Promise<LLMResult> => {
  if (!genAI) {
    throw new Error("GEMINI_API_KEY ausente.");
  }

  const modelsToTry = Array.from(
    new Set([GEMINI_MODEL, "gemini-2.5-pro", "gemini-2.5-flash"])
  );

  const errors: any[] = [];

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const text = result.response.text();
      const parsed = parseJsonStrict(text);

      return { ...parsed, prompt, modelUsed: modelName };
    } catch (err: any) {
      const message = err?.message || String(err);
      const status = err?.status;

      const isQuota =
        status === 429 ||
        status === 403 ||
        message.toLowerCase().includes("quota") ||
        message.toLowerCase().includes("rate limit");

      errors.push({ model: modelName, message, status });

      if (!isQuota) throw err; // fail fast if NOT quota
    }
  }

  const summarized = errors
    .map((e) => `${e.model} => ${e.message}`)
    .join(" | ");

  throw new Error(
    `Todos os modelos Gemini falharam (${modelsToTry.join(
      ", "
    )}). Erros: ${summarized}`
  );
};

/* ---------------------------------------------
 * ANTHROPIC EXECUTION
 * --------------------------------------------- */

const runWithAnthropic = async (
  prompt: string,
  modelName?: string
): Promise<LLMResult> => {
  if (!anthropic) {
    throw new Error("ANTHROPIC_API_KEY ausente.");
  }

  const model = modelName || ANTHROPIC_MODEL;

  const resp = await anthropic.messages.create({
    model,
    max_tokens: 4096,
    temperature: 0.2,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const text = resp?.content?.[0]?.text || "";
  const parsed = parseJsonStrict(text);

  return { ...parsed, prompt, modelUsed: model };
};

/* ---------------------------------------------
 * OPENAI EXECUTION
 * --------------------------------------------- */

const runWithOpenAI = async (
  prompt: string,
  modelName?: string
): Promise<LLMResult> => {
  if (!openai) {
    throw new Error("OPENAI_API_KEY ausente.");
  }

  const model = modelName || OPENAI_MODEL;

  const completion = await openai.chat.completions.create({
    model,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: "Você é um revisor de segurança. Responda apenas em JSON.",
      },
      { role: "user", content: prompt },
    ],
  });

  const text = completion.choices?.[0]?.message?.content || "";
  const parsed = parseJsonStrict(text);

  return { ...parsed, prompt, modelUsed: model };
};

/* ---------------------------------------------
 * MODEL ROUTING TABLE
 * --------------------------------------------- */

const MODEL_ROUTING: Record<
  string,
  { provider: "anthropic" | "openai" | "gemini"; model: string }
> = {
  "sonnet-4.5": { provider: "anthropic", model: ANTHROPIC_MODEL },
  "gpt-5.1": { provider: "openai", model: OPENAI_MODEL },
  "gemini-3.0": { provider: "gemini", model: GEMINI_MODEL },
};

/* ---------------------------------------------
 * MAIN ENTRY: MULTI-MODEL LOGIC
 * --------------------------------------------- */

export const analyzePullRequestWithLLM = async (
  input: PullRequestAnalysisInput,
  preferredModel?: string | null
): Promise<LLMResult> => {
  const prompt = buildGeminiPrompt(input);

  const route =
    (preferredModel && MODEL_ROUTING[preferredModel]) || {
      provider: "openai",
      model: OPENAI_MODEL,
    };

  switch (route.provider) {
    case "anthropic":
      return runWithAnthropic(prompt, route.model);

    case "openai":
      return runWithOpenAI(prompt, route.model);

    case "gemini":
    default:
      return runWithGemini(prompt);
  }
};
