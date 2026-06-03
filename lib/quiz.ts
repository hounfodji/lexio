import type { QuizType, CefrLevel } from "@/lib/types";

// Données minimales d'un mot nécessaires pour construire un quiz.
export interface QuizWord {
  id: string;
  word: string;
  english_definition: string | null;
  french_translation: string | null;
  example_sentence: string | null;
  cefr_level: CefrLevel | null;
}

export interface QuizQuestion {
  vocabularyId: string;
  type: QuizType;
  prompt: string; // consigne
  subject: string; // définition / phrase / mot affiché
  options: string[]; // vide pour fill_in_blank
  answer: string; // bonne réponse (mot ou définition)
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Choisit jusqu'à `n` distracteurs, en priorisant le même niveau CEFR (F6.2).
function distractors(
  word: QuizWord,
  pool: QuizWord[],
  map: (w: QuizWord) => string | null,
  n = 3,
): string[] {
  const others = pool.filter((w) => w.id !== word.id);
  const same = others.filter((w) => w.cefr_level === word.cefr_level);
  const rest = others.filter((w) => w.cefr_level !== word.cefr_level);

  const values = new Set<string>();
  for (const w of [...shuffle(same), ...shuffle(rest)]) {
    const v = map(w);
    if (v && !values.has(v)) values.add(v);
    if (values.size >= n) break;
  }
  return [...values];
}

// Normalise une réponse texte (fill-in-the-blank).
export function normalizeAnswer(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:'"]/g, "");
}

export function isAnswerCorrect(question: QuizQuestion, given: string): boolean {
  return normalizeAnswer(given) === normalizeAnswer(question.answer);
}

// Remplace le mot par un trou dans la phrase d'exemple.
function blankOut(sentence: string, word: string): string | null {
  const re = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
  if (!re.test(sentence)) return null;
  return sentence.replace(re, "_____");
}

// Types de quiz éligibles pour un mot donné, selon les données disponibles.
function eligibleTypes(word: QuizWord, pool: QuizWord[]): QuizType[] {
  const types: QuizType[] = [];
  const hasWordDistractor =
    distractors(word, pool, (w) => w.word, 1).length >= 1;
  const hasDefDistractor =
    distractors(word, pool, (w) => w.english_definition, 1).length >= 1;

  if (word.english_definition && hasWordDistractor) types.push("def_to_word");
  if (word.french_translation && hasWordDistractor)
    types.push("multiple_choice");
  if (word.english_definition && hasDefDistractor) types.push("word_to_def");
  if (word.example_sentence && blankOut(word.example_sentence, word.word))
    types.push("fill_in_blank");

  return types;
}

function buildOfType(
  type: QuizType,
  word: QuizWord,
  pool: QuizWord[],
): QuizQuestion {
  switch (type) {
    case "def_to_word": {
      const opts = shuffle([
        word.word,
        ...distractors(word, pool, (w) => w.word),
      ]);
      return {
        vocabularyId: word.id,
        type,
        prompt: "Quel mot correspond à cette définition ?",
        subject: word.english_definition!,
        options: opts,
        answer: word.word,
      };
    }
    case "multiple_choice": {
      const opts = shuffle([
        word.word,
        ...distractors(word, pool, (w) => w.word),
      ]);
      return {
        vocabularyId: word.id,
        type,
        prompt: "Quel mot a cette traduction ?",
        subject: word.french_translation!,
        options: opts,
        answer: word.word,
      };
    }
    case "word_to_def": {
      const opts = shuffle([
        word.english_definition!,
        ...distractors(word, pool, (w) => w.english_definition),
      ]);
      return {
        vocabularyId: word.id,
        type,
        prompt: "Que signifie ce mot ?",
        subject: word.word,
        options: opts,
        answer: word.english_definition!,
      };
    }
    case "fill_in_blank":
    default: {
      return {
        vocabularyId: word.id,
        type: "fill_in_blank",
        prompt: "Complète la phrase avec le bon mot.",
        subject: blankOut(word.example_sentence!, word.word)!,
        options: [],
        answer: word.word,
      };
    }
  }
}

// Construit une question par mot dû ; type choisi aléatoirement parmi les
// types éligibles (priorité à varier les angles — F6.1).
export function buildQuestions(
  dueWords: QuizWord[],
  pool: QuizWord[],
): QuizQuestion[] {
  return dueWords.map((word) => {
    const types = eligibleTypes(word, pool);
    // Repli si aucun type éligible (peu de mots) : word_to_def sans distracteur.
    if (types.length === 0) {
      return {
        vocabularyId: word.id,
        type: "word_to_def" as QuizType,
        prompt: "Que signifie ce mot ?",
        subject: word.word,
        options: word.english_definition ? [word.english_definition] : [word.word],
        answer: word.english_definition ?? word.word,
      };
    }
    return buildOfType(pick(types), word, pool);
  });
}
