"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { isAnswerCorrect, type QuizQuestion } from "@/lib/quiz";

export function ReviewSession({ questions }: { questions: QuizQuestion[] }) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"answering" | "feedback">("answering");
  const [selected, setSelected] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [lastCorrect, setLastCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);

  const question = questions[index];
  const isFill = question.type === "fill_in_blank";

  function record(correct: boolean) {
    fetch("/api/quiz/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vocabularyId: question.vocabularyId,
        quizType: question.type,
        isCorrect: correct,
      }),
    }).catch(() => {});
  }

  function answer(value: string) {
    if (phase === "feedback") return;
    const correct = isAnswerCorrect(question, value);
    setLastCorrect(correct);
    if (correct) setCorrectCount((c) => c + 1);
    setSelected(value);
    setPhase("feedback");
    record(correct);
  }

  function next() {
    if (index + 1 >= questions.length) {
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setPhase("answering");
    setSelected(null);
    setInput("");
  }

  if (done) {
    const pct = Math.round((correctCount / questions.length) * 100);
    return (
      <div className="mx-auto max-w-md space-y-5 text-center">
        <Trophy className="mx-auto size-12 text-warning" />
        <h2 className="text-2xl font-semibold tracking-tight">
          Session terminée !
        </h2>
        <p className="text-muted-foreground">
          {correctCount} / {questions.length} bonnes réponses ({pct}%)
        </p>
        <div className="flex justify-center gap-2">
          <Button nativeButton={false} render={<Link href="/dashboard" />}>
            Tableau de bord
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/review" />}
          >
            Réviser encore
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">
          Question {index + 1} / {questions.length}
        </p>
        <Progress value={((index + (phase === "feedback" ? 1 : 0)) / questions.length) * 100} />
      </div>

      <div className="rounded-xl border bg-card p-6">
        <p className="text-sm text-muted-foreground">{question.prompt}</p>
        <p
          className={cn(
            "mt-2 text-lg",
            isFill ? "leading-relaxed" : "font-medium",
          )}
        >
          {question.subject}
        </p>

        {/* QCM */}
        {!isFill && (
          <div className="mt-5 flex flex-col gap-2">
            {question.options.map((opt) => {
              const isAnswer = opt === question.answer;
              const isSelected = opt === selected;
              const showCorrect = phase === "feedback" && isAnswer;
              const showWrong = phase === "feedback" && isSelected && !isAnswer;
              return (
                <button
                  key={opt}
                  type="button"
                  disabled={phase === "feedback"}
                  onClick={() => answer(opt)}
                  className={cn(
                    "flex items-center justify-between rounded-md border px-4 py-3 text-left text-sm transition-colors",
                    phase === "answering" && "hover:bg-accent",
                    showCorrect && "border-success bg-success-muted text-success",
                    showWrong && "border-destructive text-destructive",
                  )}
                >
                  {opt}
                  {showCorrect && <Check className="size-4" />}
                  {showWrong && <X className="size-4" />}
                </button>
              );
            })}
          </div>
        )}

        {/* Texte à trou */}
        {isFill && (
          <form
            className="mt-5 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (input.trim()) answer(input);
            }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ta réponse…"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              disabled={phase === "feedback"}
              autoFocus
            />
            {phase === "answering" && (
              <Button type="submit" disabled={!input.trim()}>
                Valider
              </Button>
            )}
          </form>
        )}

        {/* Feedback */}
        {phase === "feedback" && (
          <div className="mt-4 space-y-3">
            <p
              className={cn(
                "flex items-center gap-2 text-sm font-medium",
                lastCorrect ? "text-success" : "text-destructive",
              )}
            >
              {lastCorrect ? (
                <>
                  <Check className="size-4" /> Correct !
                </>
              ) : (
                <>
                  <X className="size-4" /> La réponse était :{" "}
                  <span className="font-semibold">{question.answer}</span>
                </>
              )}
            </p>
            <Button className="w-full" onClick={next}>
              {index + 1 >= questions.length ? "Voir le score" : "Suivant"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
