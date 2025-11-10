export const PROVIDERS = {
  "hf-inference": {
    name: "Hugging Face Inference",
    max_tokens: 4_096,
    id: "hf-inference",
  },
  "openai-compatible": {
    name: "OpenAI Compatible",
    max_tokens: 128_000,
    id: "openai-compatible",
  },
};

export const MODELS = [
  {
    value: "qwen3-coder-7b-instruct",
    label: "Qwen3 Coder 7B Instruct (Default)",
    providers: ["hf-inference"],
    autoProvider: "hf-inference",
    isThinker: false,
  },
  {
    value: "qwen3-coder-30b-instruct",
    label: "Qwen3 Coder 30B Instruct",
    providers: ["hf-inference"],
    autoProvider: "hf-inference",
    isThinker: false,
  },
  {
    value: "qwen2.5-14b-instruct",
    label: "Qwen2.5 14B Instruct",
    providers: ["hf-inference"],
    autoProvider: "hf-inference",
    isThinker: false,
  },
  {
    value: "gpt-4o-mini",
    label: "GPT-4o Mini",
    providers: ["openai-compatible"],
    autoProvider: "openai-compatible",
    isThinker: false,
  },
];
