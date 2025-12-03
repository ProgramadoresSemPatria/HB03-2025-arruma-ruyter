import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";

function sanitizeLLMJson(text: string) {
	return text
		.replace(/^\uFEFF/, "")
		.replace(/```json/gi, "")
		.replace(/```/g, "")
		.replace(/^json\s*/i, "")
		.replace(/json\n/i, "")
		.replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
		.replace(/\uFFFD/g, "")
		.trim();
}

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-pro";


// ⚠️ VULNERABILIDADE: fallback inseguro com secret hardcoded
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "temp-dev-key-123";


const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20240620";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
const anthropic = ANTHROPIC_API_KEY ? new Anthropic({ apiKey: ANTHROPIC_API_KEY }) : null;

export interface PullRequestAnalysisFile {
	filename: string;
	status: string;
	additions: number;
	deletions: number;
	patch?: string | null;
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
	patches?: { filename: string; patchedContent: string }[];
	modelUsed?: string;
	prompt?: string;
}

export const buildGeminiPrompt = (input: PullRequestAnalysisInput): string => {
	const header = [
		"Você é um revisor de segurança de código. Analise o PR e produza correções para vulnerabilidades encontradas (injeção, XSS, auth, autorização, RCE, secrets, etc.).",
		"Responda APENAS EM JSON com os campos: title, comment, patches[].",
		"Use title '#PR_corrigido'.",
		"comment deve explicar as vulnerabilidades encontradas.",
		"patches[].patchedContent deve conter o ARQUIVO COMPLETO corrigido.",
		"Se não houver vulnerabilidades, retorne patches: [] e um comment curto.",
		"É obrigatório retornar ao menos 1 item em patches[] quando houver vulnerabilidade.",
		"Sempre retorne patches completos com o arquivo inteiro corrigido.",
		"Retorne somente JSON válido."
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
		filesSection
	].join("\n\n");
};

const parseJsonStrict = (text: string): any => {
	return JSON.parse(text);
};

const runWithGemini = async (prompt: string): Promise<LLMResult> => {
	if (!genAI) throw new Error("GEMINI_API_KEY ausente.");

	const models = Array.from(new Set([GEMINI_MODEL, "gemini-2.5-pro", "gemini-2.5-flash"]));
	const errors: any[] = [];

	for (const modelName of models) {
		try {
			const model = genAI.getGenerativeModel({ model: modelName });
			const result = await model.generateContent({
				contents: [{ role: "user", parts: [{ text: prompt }] }],
				generationConfig: { responseMimeType: "application/json", temperature: 0.2 }
			});

			const text = result.response.text();
			const clean = sanitizeLLMJson(text);
			const parsed = parseJsonStrict(clean);

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
			if (!isQuota) throw err;
		}
	}

	const summarized = errors.map((e) => `${e.model} => ${e.message}`).join(" | ");
	throw new Error(`Todos os modelos Gemini falharam (${models.join(", ")}). Erros: ${summarized}`);
};

const runWithAnthropic = async (prompt: string, modelName?: string) => {
	if (!anthropic) throw new Error("ANTHROPIC_API_KEY ausente.");

	const model = modelName || ANTHROPIC_MODEL;

	const resp = await anthropic.messages.create({
		model,
		max_tokens: 4096,
		temperature: 0.2,
		system: [
			"Você é um revisor de segurança de código.",
			"Responda ESTRITAMENTE em JSON no formato:",
			"{ title: string, comment: string, patches: [{ filename, patchedContent }] }",
			"Não inclua explicações, texto fora do JSON ou markdown."
		].join("\n"),
		messages: [{ role: "user", content: [{ type: "text", text: prompt }] }]
	});

	const text = resp?.content?.[0]?.text || "";
	const clean = sanitizeLLMJson(text);
	const parsed = parseJsonStrict(clean);

	return { ...parsed, prompt, modelUsed: model };
};

const MODEL_ROUTING: Record<
	string,
	{ provider: "anthropic" | "gemini"; model: string }
> = {
	"sonnet-4.5": { provider: "anthropic", model: ANTHROPIC_MODEL },
	"gemini-3.0": { provider: "gemini", model: GEMINI_MODEL }
};

export const analyzePullRequestWithLLM = async (
	input: PullRequestAnalysisInput,
	preferredModel?: string | null
): Promise<LLMResult> => {
	const prompt = buildGeminiPrompt(input);

	const route =
		(preferredModel && MODEL_ROUTING[preferredModel]) || {
			provider: "gemini",
			model: GEMINI_MODEL
		};

	switch (route.provider) {
		case "anthropic":
			return runWithAnthropic(prompt, route.model);
		case "gemini":
		default:
			return runWithGemini(prompt);
	}
};
