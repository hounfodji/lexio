import OpenAI from "openai";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types";
import { decrypt } from "@/lib/ai/crypto";
import {
  DEFAULT_PROVIDER,
  PROVIDERS,
  isProviderId,
  type ProviderId,
} from "@/lib/ai/providers";

export interface ResolvedAI {
  client: OpenAI;
  model: string;
  providerLabel: string;
}

interface Resolution {
  provider: ProviderId;
  apiKey: string;
  model?: string;
}

// Config par défaut, tirée des variables d'environnement (déploiement).
// Compat ascendante : si seul OPENAI_API_KEY est présent, on reste sur OpenAI.
function envResolution(): Resolution | null {
  const envProvider = process.env.AI_PROVIDER;
  const apiKey = process.env.AI_API_KEY ?? process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  let provider: ProviderId;
  if (envProvider && isProviderId(envProvider)) {
    provider = envProvider;
  } else if (!process.env.AI_API_KEY && process.env.OPENAI_API_KEY) {
    provider = "openai";
  } else {
    provider = DEFAULT_PROVIDER;
  }

  return { provider, apiKey, model: process.env.AI_MODEL };
}

// Résout la config IA : clé perso de l'utilisateur si définie, sinon env.
export async function resolveAIConfig(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<ResolvedAI> {
  let resolution: Resolution | null = null;

  const { data: row } = await supabase
    .from("user_ai_settings")
    .select("provider, api_key_cipher, model")
    .eq("user_id", userId)
    .maybeSingle();

  if (row?.api_key_cipher && isProviderId(row.provider)) {
    try {
      resolution = {
        provider: row.provider,
        apiKey: decrypt(row.api_key_cipher),
        model: row.model ?? undefined,
      };
    } catch {
      // Déchiffrement impossible (AI_KEY_SECRET absente/changée) → fallback env.
      resolution = null;
    }
  }

  resolution ??= envResolution();

  if (!resolution) {
    throw new Error(
      "Aucune clé IA configurée. Définis AI_API_KEY (ou OPENAI_API_KEY), ou ajoute ta clé dans Réglages.",
    );
  }

  const config = PROVIDERS[resolution.provider];
  return {
    client: new OpenAI({ apiKey: resolution.apiKey, baseURL: config.baseURL }),
    model: resolution.model || config.defaultModel,
    providerLabel: config.label,
  };
}
