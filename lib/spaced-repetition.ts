import type { WordStatus } from "@/lib/types";

// Intervalles de répétition espacée, en jours (PRD §7 / §11.5).
export const INTERVALS = [1, 3, 7, 14, 30] as const;
export const MAX_INTERVAL_INDEX = INTERVALS.length - 1; // 4
const MASTERED_THRESHOLD = 80;

export interface SrState {
  review_count: number;
  interval_index: number;
  mastery_score: number;
  status: WordStatus;
  next_review_date: string; // YYYY-MM-DD
}

export interface SrInput {
  review_count: number;
  interval_index: number;
  mastery_score: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// Date (YYYY-MM-DD) à `days` jours d'aujourd'hui, en UTC.
function dateInDays(days: number): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// Réponse correcte → on avance d'un cran (PRD §11.5).
export function onCorrect(word: SrInput): SrState {
  const interval_index = clamp(word.interval_index + 1, 0, MAX_INTERVAL_INDEX);
  const mastery_score = clamp(word.mastery_score + 20, 0, 100);
  const status: WordStatus =
    interval_index === MAX_INTERVAL_INDEX && mastery_score >= MASTERED_THRESHOLD
      ? "mastered"
      : "learning";

  return {
    review_count: word.review_count + 1,
    interval_index,
    mastery_score,
    status,
    next_review_date: dateInDays(INTERVALS[interval_index]),
  };
}

// Réponse incorrecte → réinitialisation à 1 jour (PRD §11.5).
export function onWrong(word: SrInput): SrState {
  return {
    review_count: word.review_count + 1,
    interval_index: 0,
    mastery_score: clamp(word.mastery_score - 15, 0, 100),
    status: "learning",
    next_review_date: dateInDays(1),
  };
}
