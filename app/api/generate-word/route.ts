import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateWordCard } from "@/lib/openai";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  let word = "";
  try {
    const body = await request.json();
    word = String(body?.word ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  if (!word || word.length > 60) {
    return NextResponse.json(
      { error: "Saisis un mot anglais valide." },
      { status: 400 },
    );
  }

  // Anti-doublon insensible à la casse (F3.3) — évite aussi un appel IA inutile.
  const pattern = word.replace(/[%_]/g, "\\$&");
  const { data: existing } = await supabase
    .from("vocabulary")
    .select("id")
    .eq("user_id", user.id)
    .ilike("word", pattern)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "Ce mot est déjà dans ta liste.", id: existing.id },
      { status: 409 },
    );
  }

  // Génération IA de la fiche.
  let card;
  try {
    card = await generateWordCard(word);
  } catch {
    return NextResponse.json(
      { error: "La génération a échoué. Réessaie." },
      { status: 502 },
    );
  }

  const { data: inserted, error } = await supabase
    .from("vocabulary")
    .insert({
      user_id: user.id,
      word: card.word || word,
      english_definition: card.english_definition,
      french_translation: card.french_translation,
      french_definition: card.french_definition,
      pronunciation: card.pronunciation,
      example_sentence: card.example_sentence,
      synonyms: card.synonyms,
      cefr_level: card.cefr_level,
    })
    .select("id")
    .single();

  if (error) {
    // 23505 = violation de contrainte unique (doublon en course).
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Ce mot est déjà dans ta liste." },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Impossible d'enregistrer le mot." },
      { status: 500 },
    );
  }

  return NextResponse.json({ id: inserted.id }, { status: 201 });
}
