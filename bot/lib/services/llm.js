import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-pro";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20240620";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";

const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.1";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const anthropic = ANTHROPIC_API_KEY ? new Anthropic({ apiKey: ANTHROPIC_API_KEY }) : null;
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

export const buildGeminiPrompt = (input) => {
  const header = [
    "Voce e um revisor de seguranca. Analise o PR e produza correcoes para qualquer vulnerabilidade identificada (injecao, XSS, auth, autorizacao, RCE, secrets, etc.).",
    "Responda em JSON com campos: title, comment, patches[].",
    "Use title '#PR_corrigido'. O comment deve incluir explicacao sucinta do problema corrigido. Nao inclua links nem placeholders de link.",
    "Cada patch deve conter filename e patchedContent (arquivo completo corrigido).",
    "Se nao houver vulnerabilidades, retorne patches: [] e um comment curto indicando que nada foi encontrado.",
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

const parseJsonStrict = (text) => {
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`LLM JSON parse failed: ${e}. Raw: ${text}`);
  }
};

const runWithGemini = async (prompt) => {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY ausente: configure no ambiente do bot");
  }

  const modelsToTry = Array.from(new Set([GEMINI_MODEL, "gemini-2.5-pro", "gemini-2.5-flash"]));
  const errors = [];

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
      });
      const text = result.response.text();
      const parsed = parseJsonStrict(text);
      return { ...parsed, prompt, modelUsed: modelName };
    } catch (err) {
      const message = err?.message || String(err);
      const status = err?.status;
      const isQuota =
        status === 429 ||
        status === 403 ||
        message.toLowerCase().includes("quota") ||
        message.toLowerCase().includes("rate limit");
      errors.push({ model: modelName, message, status });
      if (!isQuota) throw err;
    }
  }

  const summarized = errors.map((e) => `${e.model} => ${e.message}`).join(" | ");
  throw new Error(`Gemini falhou em todos os modelos testados (${modelsToTry.join(", ")}). Erros: ${summarized}`);
};

const runWithAnthropic = async (prompt, modelName) => {
  if (!anthropic) {
    throw new Error("ANTHROPIC_API_KEY ausente: configure no ambiente do bot");
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

const runWithOpenAI = async (prompt, modelName) => {
  if (!openai) {
    throw new Error("OPENAI_API_KEY ausente: configure no ambiente do bot");
  }
  const model = modelName || OPENAI_MODEL;
  const completion = await openai.chat.completions.create({
    model,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: "Voce e um revisor de seguranca. Responda apenas em JSON." },
      { role: "user", content: prompt },
    ],
  });
  const text = completion.choices?.[0]?.message?.content || "";
  const parsed = parseJsonStrict(text);
  return { ...parsed, prompt, modelUsed: model };
};

const MODEL_ROUTING = {
  "sonnet-4.5": { provider: "anthropic", model: ANTHROPIC_MODEL },
  "gpt-5.1": { provider: "openai", model: OPENAI_MODEL },
  "gemini-3.0": { provider: "gemini", model: GEMINI_MODEL },
};

export const analyzePullRequestWithLLM = async (input, preferredModel) => {
  const prompt = buildGeminiPrompt(input);
  const route = MODEL_ROUTING[preferredModel || ""] || { provider: "openai", model: OPENAI_MODEL };

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
