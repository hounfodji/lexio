"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { INTERESTS } from "@/lib/interests";

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
