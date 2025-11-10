import {
  DIVIDER,
  FOLLOW_UP_SYSTEM_PROMPT,
  INITIAL_SYSTEM_PROMPT,
  REPLACE_END,
  SEARCH_START,
} from "@/lib/prompts";

const DEFAULT_MODEL_ID =
  process.env.HF_QWEN3_CODER_7B_MODEL_ID ?? "Qwen/Qwen3-Coder-7B-Instruct";
const DEFAULT_API_URL =
  process.env.HF_API_URL ??
  `https://api-inference.huggingface.co/models/${DEFAULT_MODEL_ID}`;

const HF_TIMEOUT_MS = Number(process.env.HF_REQUEST_TIMEOUT_MS ?? 120_000);

type HuggingFaceGenerateOptions = {
  prompt: string;
  provider?: string;
  model?: string;
  redesignMarkdown?: string;
  html?: string;
  previousPrompt?: string;
  selectedElementHtml?: string;
  mode: "generate" | "modify";
};

const removePromptPrefix = (generated: string, prompt: string) => {
  if (!generated.startsWith(prompt)) {
    return generated;
  }
  return generated.slice(prompt.length);
};

const buildGeneratePrompt = ({
  prompt,
  redesignMarkdown,
  html,
}: {
  prompt: string;
  redesignMarkdown?: string;
  html?: string;
}) => {
  if (redesignMarkdown) {
    return `${INITIAL_SYSTEM_PROMPT}

The user is providing a markdown representation of an existing website. You must create a brand new HTML design inspired by this markdown.

Markdown description:
${redesignMarkdown}

Respond with an improved full HTML document.`;
  }

  if (html) {
    return `${INITIAL_SYSTEM_PROMPT}

The user provided existing HTML. Create a brand new design based on their prompt, ignoring the previous HTML unless otherwise specified.

Existing HTML:
\`\`\`html
${html}
\`\`\`

User request:
${prompt}

Respond with a complete HTML document.`;
  }

  return `${INITIAL_SYSTEM_PROMPT}

User request:
${prompt}

Respond with a complete HTML document.`;
};

const buildModifyPrompt = ({
  prompt,
  html,
  previousPrompt,
  selectedElementHtml,
}: {
  prompt: string;
  html: string;
  previousPrompt?: string;
  selectedElementHtml?: string;
}) => {
  return `${FOLLOW_UP_SYSTEM_PROMPT}

Previous request context: ${previousPrompt ?? "No previous context supplied."}

Current HTML:
\`\`\`html
${html}
\`\`\`

${selectedElementHtml ? `Only modify the following element:\n\`\`\`html\n${selectedElementHtml}\n\`\`\`\n` : ""}
User request:
${prompt}

Ensure you follow the SEARCH/REPLACE instructions exactly.`;
};

const MODEL_REGISTRY: Record<string, string> = {
  "qwen3-coder-7b-instruct":
    process.env.HF_QWEN3_CODER_7B_MODEL_ID ?? "Qwen/Qwen3-Coder-7B-Instruct",
  "qwen3-coder-30b-instruct":
    process.env.HF_QWEN3_CODER_30B_MODEL_ID ??
    "Qwen/Qwen3-Coder-30B-A3B-Instruct",
  "qwen2.5-14b-instruct":
    process.env.HF_QWEN_MODEL_ID ?? "Qwen/Qwen2.5-14B-Instruct",
};

const resolveModelUrl = (model?: string) => {
  if (!model) return DEFAULT_API_URL;
  const registryEntry = MODEL_REGISTRY[model];
  if (!registryEntry) return DEFAULT_API_URL;
  if (registryEntry.startsWith("http")) return registryEntry;
  return `https://api-inference.huggingface.co/models/${registryEntry}`;
};

export async function generateWithHuggingFace({
  prompt,
  redesignMarkdown,
  html,
  previousPrompt,
  selectedElementHtml,
  model,
  mode,
}: HuggingFaceGenerateOptions) {
  const apiToken = process.env.HF_API_TOKEN;
  const apiUrl = resolveModelUrl(model);

  if (!apiToken) {
    throw new Error(
      "Missing Hugging Face token (HF_API_TOKEN). Please configure it to use the default open-source model."
    );
  }

  const finalPrompt =
    mode === "modify"
      ? buildModifyPrompt({ prompt, html: html ?? "", previousPrompt, selectedElementHtml })
      : buildGeneratePrompt({ prompt, redesignMarkdown, html });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HF_TIMEOUT_MS);

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        inputs: finalPrompt,
        parameters: {
          max_new_tokens: Number(process.env.HF_MAX_NEW_TOKENS ?? 2048),
          temperature: Number(process.env.HF_TEMPERATURE ?? 0.7),
          top_p: Number(process.env.HF_TOP_P ?? 0.9),
          repetition_penalty: Number(process.env.HF_REPETITION_PENALTY ?? 1.05),
        },
        options: {
          wait_for_model: true,
        },
      }),
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => undefined);
      const errorMessage =
        (errorPayload && (errorPayload.error || errorPayload.message)) ??
        `${response.status} ${response.statusText}`;
      throw new Error(`Hugging Face request failed: ${errorMessage}`);
    }

    const data = await response.json();

    const textPayload = Array.isArray(data)
      ? data[0]?.generated_text ?? ""
      : data?.generated_text ?? "";

    if (!textPayload) {
      throw new Error("Hugging Face model returned an empty response.");
    }

    const cleaned = removePromptPrefix(textPayload, finalPrompt).trim();
    return cleaned || textPayload.trim();
  } finally {
    clearTimeout(timeout);
  }
}

export const HF_SUPPORTED_MODELS = new Set<string>([
  "qwen3-coder-7b-instruct",
  "qwen3-coder-30b-instruct",
  "qwen2.5-14b-instruct",
  process.env.HF_QWEN_MODEL_NAME ?? "",
  process.env.HF_QWEN3_CODER_7B_MODEL_ID ?? "",
  process.env.HF_QWEN3_CODER_30B_MODEL_ID ?? "",
].filter(Boolean));

export const MODIFY_RESPONSE_MARKERS = {
  SEARCH_START,
  DIVIDER,
  REPLACE_END,
};

