import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CefrBadge } from "@/components/vocabulary/cefr-badge";
import type { Vocabulary } from "@/lib/types";

const STATUS_LABEL: Record<Vocabulary["status"], string> = {
  new: "Nouveau",
  learning: "En cours",
  mastered: "Maîtrisé",
};

export function WordListItem({ word }: { word: Vocabulary }) {
  return (
    <Link
      href={`/vocabulary/${word.id}`}
      className="flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium">{word.word}</span>
          {word.pronunciation && (
            <span className="hidden truncate text-xs text-muted-foreground sm:inline">
              {word.pronunciation}
            </span>
          )}
          <CefrBadge level={word.cefr_level} />
        </div>
        <p className="truncate text-sm text-muted-foreground">
          {word.french_translation ?? word.english_definition ?? "—"}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-[11px] text-muted-foreground">
            {STATUS_LABEL[word.status]}
          </p>
          <div className="mt-1 h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-info"
              style={{ width: `${word.mastery_score}%` }}
            />
          </div>
        </div>
        <ChevronRight className="size-4 text-muted-foreground" />
      </div>
    </Link>
  );
}
