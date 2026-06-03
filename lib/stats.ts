import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types";

export interface DashboardStats {
  total: number;
  mastered: number;
  learning: number;
  dueToday: number;
  streak: number;
}

function todayUTC(): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

// Streak = nombre de jours consécutifs (jusqu'à aujourd'hui ou hier) comportant
// au moins une tentative de quiz. Dérivé de quiz_attempts (pas de table dédiée).
export function computeStreak(timestamps: string[]): number {
  if (timestamps.length === 0) return 0;

  const days = new Set(
    timestamps.map((ts) => {
      const d = new Date(ts);
      d.setUTCHours(0, 0, 0, 0);
      return d.toISOString().slice(0, 10);
    }),
  );

  const cursor = new Date(`${todayUTC()}T00:00:00.000Z`);
  const key = () => cursor.toISOString().slice(0, 10);

  // Si rien aujourd'hui, on autorise le streak à démarrer hier.
  if (!days.has(key())) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    if (!days.has(key())) return 0;
  }

  let streak = 0;
  while (days.has(key())) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

export async function getDashboardStats(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<DashboardStats> {
  const today = todayUTC();

  const [{ data: words }, { data: attempts }] = await Promise.all([
    supabase
      .from("vocabulary")
      .select("status, next_review_date")
      .eq("user_id", userId),
    supabase
      .from("quiz_attempts")
      .select("created_at")
      .eq("user_id", userId),
  ]);

  const rows = words ?? [];
  const stats: DashboardStats = {
    total: rows.length,
    mastered: rows.filter((w) => w.status === "mastered").length,
    learning: rows.filter((w) => w.status === "learning").length,
    dueToday: rows.filter((w) => w.next_review_date <= today).length,
    streak: computeStreak((attempts ?? []).map((a) => a.created_at)),
  };

  return stats;
}
