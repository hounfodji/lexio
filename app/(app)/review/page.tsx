import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { buildQuestions, type QuizWord } from "@/lib/quiz";
import { ReviewSession } from "@/components/quiz/review-session";
import { Button } from "@/components/ui/button";

const SESSION_SIZE = 20;

export default async function ReviewPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vocabulary")
    .select(
      "id, word, english_definition, french_translation, example_sentence, cefr_level, next_review_date",
    )
    .order("next_review_date", { ascending: true });

  const pool = (data ?? []) as (QuizWord & { next_review_date: string })[];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const todayStr = today.toISOString().slice(0, 10);

  const due = pool
    .filter((w) => w.next_review_date <= todayStr)
    .slice(0, SESSION_SIZE);

  if (due.length === 0) {
    return (
      <div className="mx-auto max-w-md space-y-4 py-10 text-center">
        <CheckCircle2 className="mx-auto size-12 text-success" />
        <h1 className="text-2xl font-semibold tracking-tight">
          Rien à réviser
        </h1>
        <p className="text-sm text-muted-foreground">
          {pool.length === 0
            ? "Ajoute d'abord des mots à ton vocabulaire."
            : "Tu es à jour ! Reviens quand des mots seront dus."}
        </p>
        <div className="flex justify-center gap-2">
          <Button nativeButton={false} render={<Link href="/vocabulary" />}>
            Mon vocabulaire
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/dashboard" />}
          >
            Tableau de bord
          </Button>
        </div>
      </div>
    );
  }

  const questions = buildQuestions(due, pool);

  return (
    <div className="space-y-6">
      <h1 className="text-center text-xl font-semibold tracking-tight">
        Révision
      </h1>
      <ReviewSession questions={questions} />
    </div>
  );
}
