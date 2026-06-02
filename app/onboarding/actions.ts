"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { INTERESTS } from "@/lib/interests";

export interface OnboardingState {
  error?: string;
}

export async function saveInterests(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
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

  if (!user) {
    redirect("/login");
  }

  const rows = selected.map((interest) => ({ user_id: user.id, interest }));
  const { error } = await supabase
    .from("user_interests")
    .upsert(rows, { onConflict: "user_id,interest" });

  if (error) {
    return { error: "Impossible d'enregistrer tes intérêts. Réessaie." };
  }

  redirect("/dashboard");
}
