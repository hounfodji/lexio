"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { onCorrect, onWrong } from "@/lib/spaced-repetition";
import type { Vocabulary } from "@/lib/types";

async function adjust(id: string, outcome: "known" | "difficult") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const { data: word } = await supabase
    .from("vocabulary")
    .select("review_count, interval_index, mastery_score")
    .eq("id", id)
    .single();

  if (!word) return { error: "Mot introuvable." };

  const next =
    outcome === "known"
      ? onCorrect(word as Pick<Vocabulary, "review_count" | "interval_index" | "mastery_score">)
      : onWrong(word as Pick<Vocabulary, "review_count" | "interval_index" | "mastery_score">);

  const { error } = await supabase
    .from("vocabulary")
    .update({
      review_count: next.review_count,
      interval_index: next.interval_index,
      mastery_score: next.mastery_score,
      status: next.status,
      next_review_date: next.next_review_date,
    })
    .eq("id", id);

  if (error) return { error: "Mise à jour impossible." };

  revalidatePath(`/vocabulary/${id}`);
  revalidatePath("/vocabulary");
  return { ok: true };
}

export async function markKnown(id: string) {
  return adjust(id, "known");
}

export async function markDifficult(id: string) {
  return adjust(id, "difficult");
}
