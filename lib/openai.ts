import OpenAI from "openai";
import { z } from "zod";
import type { CefrLevel } from "@/lib/types";

// Modèle par défaut — rapide, peu coûteux, structured outputs fiables.
export const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

let _client: OpenAI | null = null;
function client(): OpenAI {
  if (!_client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY manquante.");
    _client = new OpenAI({ apiKey });
  }
  return _client;
}

// Schéma de validation de la fiche (F3.2).
export const wordCardSchema = z.object({
  word: z.string().min(1),
  english_definition: z.string().min(1),
  french_translation: z.string().min(1),
  french_definition: z.string().min(1),
  pronunciation: z.string().min(1), // IPA
  example_sentence: z.string().min(1),
  synonyms: z.array(z.string()).max(8),
  cefr_level: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
});

export type WordCard = z.infer<typeof wordCardSchema>;

// JSON Schema (strict) pour les structured outputs OpenAI.
const wordCardJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    word: { type: "string" },
    english_definition: { type: "string" },
    french_translation: { type: "string" },
    french_definition: { type: "string" },
    pronunciation: { type: "string", description: "Transcription IPA, ex: /ˈher.ə.tɪk/" },
    example_sentence: { type: "string" },
    synonyms: { type: "array", items: { type: "string" } },
    cefr_level: { type: "string", enum: ["A1", "A2", "B1", "B2", "C1", "C2"] },
  },
  required: [
    "word",
    "english_definition",
    "french_translation",
    "french_definition",
    "pronunciation",
    "example_sentence",
    "synonyms",
    "cefr_level",
  ],
} as const;

const WORD_SYSTEM_PROMPT = `Tu es un lexicographe bilingue anglais-français.
Pour un mot anglais donné, produis une fiche d'apprentissage rigoureuse :
- english_definition : définition claire et concise en anglais.
- french_translation : la ou les traductions françaises les plus courantes.
- french_definition : définition en français.
- pronunciation : transcription phonétique IPA (avec les barres obliques).
- example_sentence : une phrase d'exemple naturelle en anglais utilisant le mot.
- synonyms : 3 à 6 synonymes anglais pertinents (tableau, peut être vide si aucun).
- cefr_level : le niveau CECRL estimé (A1, A2, B1, B2, C1 ou C2).
Réponds uniquement via le format structuré demandé.`;

/**
 * Génère la fiche IA d'un mot anglais. Valide la sortie avec Zod et
 * réessaie une fois si le parsing échoue (PRD §12).
 */
export async function generateWordCard(word: string): Promise<WordCard> {
  const trimmed = word.trim();

  async function attempt(): Promise<WordCard> {
    const completion = await client().chat.completions.create({
      model: OPENAI_MODEL,
      temperature: 0.3,
      messages: [
        { role: "system", content: WORD_SYSTEM_PROMPT },
        { role: "user", content: `Mot : "${trimmed}"` },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "word_card",
          strict: true,
          schema: wordCardJsonSchema,
        },
      },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Réponse OpenAI vide.");
    const card = wordCardSchema.parse(JSON.parse(content));

    // Normalise l'IPA entre barres obliques (ex: ˈhɛrɪtɪk → /ˈhɛrɪtɪk/).
    const ipa = card.pronunciation.trim().replace(/^\/+|\/+$/g, "");
    card.pronunciation = ipa ? `/${ipa}/` : card.pronunciation;
    return card;
  }

  try {
    return await attempt();
  } catch {
    // Un seul retry avant de remonter l'erreur.
    return await attempt();
  }
}

export type { CefrLevel };
