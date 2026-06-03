"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { INTERESTS } from "@/lib/interests";
import { encrypt, isEncryptionAvailable } from "@/lib/ai/crypto";
import { isProviderId } from "@/lib/ai/providers";

export interface SettingsState {
  error?: string;
  success?: boolean;
}

export async function updateInterests(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const selected = formData
    .getAll("interest")
    .map(String)
    .filter((i) => (INTERESTS as readonly string[]).includes(i));

  if (selected.length < 1) {
    return { error: "Choisis au moins un centre d'intérêt." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  // Remplace l'ensemble des intérêts par la nouvelle sélection.
  await supabase.from("user_interests").delete().eq("user_id", user.id);
  const { error } = await supabase
    .from("user_interests")
    .insert(selected.map((interest) => ({ user_id: user.id, interest })));

  if (error) {
    return { error: "Impossible d'enregistrer. Réessaie." };
  }

  revalidatePath("/settings");
  return { success: true };
}

export async function saveAISettings(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const provider = String(formData.get("provider") ?? "");
  const key = String(formData.get("api_key") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();

  if (!isProviderId(provider)) {
    return { error: "Fournisseur inconnu." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const { data: existing } = await supabase
    .from("user_ai_settings")
    .select("api_key_cipher")
    .eq("user_id", user.id)
    .maybeSingle();

  // La clé est requise s'il n'en existe pas déjà une enregistrée.
  if (!key && !existing?.api_key_cipher) {
    return { error: "Colle ta clé API pour activer ce fournisseur." };
  }
  if (key && !isEncryptionAvailable()) {
    return {
      error:
        "Chiffrement indisponible : définis AI_KEY_SECRET côté serveur pour enregistrer une clé.",
    };
  }

  const row = {
    user_id: user.id,
    provider,
    model: model || null,
    // Si une nouvelle clé est fournie, on la chiffre ; sinon on garde l'existante.
    ...(key
      ? { api_key_cipher: encrypt(key) }
      : { api_key_cipher: existing?.api_key_cipher ?? null }),
  };

  const { error } = await supabase
    .from("user_ai_settings")
    .upsert(row, { onConflict: "user_id" });

  if (error) return { error: "Impossible d'enregistrer. Réessaie." };

  revalidatePath("/settings");
  return { success: true };
}

export async function clearAISettings(): Promise<SettingsState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  await supabase.from("user_ai_settings").delete().eq("user_id", user.id);
  revalidatePath("/settings");
  return { success: true };
}
