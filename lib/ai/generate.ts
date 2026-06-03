import type OpenAI from "openai";
import { z } from "zod";
import type { CefrLevel } from "@/lib/types";

// Runtime IA résolu (client compatible OpenAI + modèle). Voir lib/ai/resolve.ts.
export interface AiRuntime {
  client: OpenAI;
  model: string;
}

// ---------------------------------------------------------------------------
// Fiche de vocabulaire (F3.2)
// ---------------------------------------------------------------------------

export const wordCardSchema = z.object({
  word: z.string().min(1),
  english_definition: z.string().min(1),
  french_translation: z.string().min(1),
  french_definition: z.string().min(1),
  pronunciation: z.string().min(1),
  example_sentence: z.string().min(1),
  synonyms: z.array(z.string()).max(8),
  cefr_level: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
});

export type WordCard = z.infer<typeof wordCardSchema>;

const WORD_SYSTEM_PROMPT = `Tu es un lexicographe bilingue anglais-français.
Pour un mot anglais donné, produis une fiche d'apprentissage rigoureuse.
Réponds UNIQUEMENT avec un objet JSON valide ayant EXACTEMENT ces clés :
- "word" (string) : le mot anglais.
- "english_definition" (string) : définition claire et concise en anglais.
- "french_translation" (string) : la/les traductions françaises courantes.
- "french_definition" (string) : définition en français.
- "pronunciation" (string) : transcription phonétique IPA (avec les barres obliques).
- "example_sentence" (string) : une phrase d'exemple naturelle en anglais.
- "synonyms" (array de string) : 3 à 6 synonymes anglais (peut être vide).
- "cefr_level" (string) : niveau CECRL parmi "A1","A2","B1","B2","C1","C2".
N'ajoute aucune clé supplémentaire, aucun texte hors du JSON.`;

async function jsonCompletion<T>(
  ai: AiRuntime,
  systemPrompt: string,
  userPrompt: string,
  temperature: number,
  parse: (raw: unknown) => T,
): Promise<T> {
  async function attempt(): Promise<T> {
    const completion = await ai.client.chat.completions.create({
      model: ai.model,
      temperature,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Réponse IA vide.");
    return parse(JSON.parse(content));
  }

  try {
    return await attempt();
  } catch {
    // Un seul retry avant de remonter l'erreur (PRD §12).
    return await attempt();
  }
}

export async function generateWordCard(
  ai: AiRuntime,
  word: string,
): Promise<WordCard> {
  const card = await jsonCompletion(
    ai,
    WORD_SYSTEM_PROMPT,
    `Mot : "${word.trim()}"`,
    0.3,
    (raw) => wordCardSchema.parse(raw),
  );

  // Normalise l'IPA entre barres obliques (ex: ˈhɛrɪtɪk → /ˈhɛrɪtɪk/).
  const ipa = card.pronunciation.trim().replace(/^\/+|\/+$/g, "");
  card.pronunciation = ipa ? `/${ipa}/` : card.pronunciation;
  return card;
}

// ---------------------------------------------------------------------------
// Histoires (F8)
// ---------------------------------------------------------------------------

export const storySchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
});

export type Story = z.infer<typeof storySchema>;

const STORY_SYSTEM_PROMPT = `Tu es un auteur pédagogue qui écrit de courtes histoires en anglais
pour des apprenants francophones. Contraintes :
- Écris une histoire NATURELLE et engageante en anglais (120 à 220 mots).
- Intègre IMPÉRATIVEMENT et de façon fluide TOUS les mots de vocabulaire fournis,
  en gardant leur forme exacte au moins une fois.
- Adapte le thème et le contexte aux centres d'intérêt fournis.
- Niveau accessible (B1-C1), histoire cohérente et amusante.
Réponds UNIQUEMENT avec un objet JSON valide ayant EXACTEMENT ces clés :
- "title" (string) : titre court et accrocheur en anglais.
- "content" (string) : le texte de l'histoire en anglais.
N'ajoute aucune clé supplémentaire, aucun texte hors du JSON.`;

export async function generateStory(
  ai: AiRuntime,
  words: string[],
  interests: string[],
): Promise<Story> {
  const wordList = words.join(", ");
  const interestList = interests.length
    ? interests.join(", ")
    : "general topics";

  return jsonCompletion(
    ai,
    STORY_SYSTEM_PROMPT,
    `Mots à intégrer : ${wordList}.\nCentres d'intérêt : ${interestList}.`,
    0.8,
    (raw) => storySchema.parse(raw),
  );
}

export type { CefrLevel };
