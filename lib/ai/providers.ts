// Registre des fournisseurs IA. Tous exposent une API compatible OpenAI :
// seuls `baseURL` et `model` changent, le reste du code est identique.
// NB : les baseURL sont les endpoints standards au moment de l'intégration ;
// vérifier la doc officielle du provider s'ils évoluent.

export interface ProviderConfig {
  label: string;
  baseURL: string;
  defaultModel: string;
  /** Indice affiché dans l'UI (où récupérer une clé). */
  hint: string;
}

export const PROVIDERS = {
  mistral: {
    label: "Mistral",
    baseURL: "https://api.mistral.ai/v1",
    defaultModel: "mistral-small-latest",
    hint: "console.mistral.ai — tier gratuit, hébergement EU",
  },
  openai: {
    label: "OpenAI",
    baseURL: "https://api.openai.com/v1",
    defaultModel: "gpt-4o-mini",
    hint: "platform.openai.com/api-keys",
  },
  gemini: {
    label: "Google Gemini",
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    defaultModel: "gemini-2.5-flash",
    hint: "aistudio.google.com — gratuit sans carte",
  },
  groq: {
    label: "Groq",
    baseURL: "https://api.groq.com/openai/v1",
    defaultModel: "llama-3.3-70b-versatile",
    hint: "console.groq.com — ultra rapide, modèles open-source",
  },
  openrouter: {
    label: "OpenRouter",
    baseURL: "https://openrouter.ai/api/v1",
    defaultModel: "deepseek/deepseek-chat:free",
    hint: "openrouter.ai/keys — une clé, des dizaines de modèles",
  },
  deepseek: {
    label: "DeepSeek",
    baseURL: "https://api.deepseek.com",
    defaultModel: "deepseek-chat",
    hint: "platform.deepseek.com",
  },
  cerebras: {
    label: "Cerebras",
    baseURL: "https://api.cerebras.ai/v1",
    defaultModel: "llama-3.3-70b",
    hint: "cloud.cerebras.ai — très rapide",
  },
} as const satisfies Record<string, ProviderConfig>;

export type ProviderId = keyof typeof PROVIDERS;

export const PROVIDER_IDS = Object.keys(PROVIDERS) as ProviderId[];

export function isProviderId(value: string): value is ProviderId {
  return value in PROVIDERS;
}

export const DEFAULT_PROVIDER: ProviderId = "mistral";
