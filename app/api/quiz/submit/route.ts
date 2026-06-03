import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { onCorrect, onWrong } from "@/lib/spaced-repetition";
import type { QuizType, Vocabulary } from "@/lib/types";

const QUIZ_TYPES: QuizType[] = [
  "def_to_word",
  "word_to_def",
  "multiple_choice",
  "fill_in_blank",
];

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  let vocabularyId: string;
  let quizType: QuizType;
  let isCorrect: boolean;
  try {
    const body = await request.json();
    vocabularyId = String(body.vocabularyId);
    quizType = body.quizType;
    isCorrect = Boolean(body.isCorrect);
    if (!vocabularyId || !QUIZ_TYPES.includes(quizType)) {
      throw new Error("invalid");
    }
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  // Le mot doit appartenir à l'utilisateur (RLS le garantit aussi).
  const { data: word } = await supabase
    .from("vocabulary")
    .select("review_count, interval_index, mastery_score")
    .eq("id", vocabularyId)
    .eq("user_id", user.id)
    .single();

  if (!word) {
    return NextResponse.json({ error: "Mot introuvable." }, { status: 404 });
  }

  // Enregistre la tentative (F6.3).
  await supabase.from("quiz_attempts").insert({
    user_id: user.id,
    vocabulary_id: vocabularyId,
    quiz_type: quizType,
    is_correct: isCorrect,
  });

  // Met à jour la répétition espacée (F6.4 / F7).
  const sr = isCorrect
    ? onCorrect(word as Pick<Vocabulary, "review_count" | "interval_index" | "mastery_score">)
    : onWrong(word as Pick<Vocabulary, "review_count" | "interval_index" | "mastery_score">);

  const { error } = await supabase
    .from("vocabulary")
    .update({
      review_count: sr.review_count,
      interval_index: sr.interval_index,
      mastery_score: sr.mastery_score,
      status: sr.status,
      next_review_date: sr.next_review_date,
    })
    .eq("id", vocabularyId)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json(
      { error: "Mise à jour impossible." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    mastery_score: sr.mastery_score,
    status: sr.status,
    next_review_date: sr.next_review_date,
  });
}
