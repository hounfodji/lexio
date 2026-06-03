import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateStory } from "@/lib/openai";

const MAX_WORDS = 6;

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  // Mots non maîtrisés en priorité (dus / faible mastery — F8.1).
  const { data: unmastered } = await supabase
    .from("vocabulary")
    .select("word")
    .eq("user_id", user.id)
    .neq("status", "mastered")
    .order("mastery_score", { ascending: true })
    .order("next_review_date", { ascending: true })
    .limit(MAX_WORDS);

  let words = (unmastered ?? []).map((w) => w.word);

  // Repli : si tout est maîtrisé, on prend quand même quelques mots récents.
  if (words.length === 0) {
    const { data: any } = await supabase
      .from("vocabulary")
      .select("word")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(MAX_WORDS);
    words = (any ?? []).map((w) => w.word);
  }

  if (words.length === 0) {
    return NextResponse.json(
      { error: "Ajoute d'abord quelques mots à ton vocabulaire." },
      { status: 400 },
    );
  }

  // Centres d'intérêt (F8.2).
  const { data: interestsRows } = await supabase
    .from("user_interests")
    .select("interest")
    .eq("user_id", user.id);
  const interests = (interestsRows ?? []).map((i) => i.interest);

  // Génération IA (F8.3).
  let story;
  try {
    story = await generateStory(words, interests);
  } catch {
    return NextResponse.json(
      { error: "La génération de l'histoire a échoué. Réessaie." },
      { status: 502 },
    );
  }

  const { data: inserted, error } = await supabase
    .from("story_history")
    .insert({
      user_id: user.id,
      title: story.title,
      content: story.content,
      words_used: words,
      interests_used: interests,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Impossible d'enregistrer l'histoire." },
      { status: 500 },
    );
  }

  return NextResponse.json({ id: inserted.id }, { status: 201 });
}
