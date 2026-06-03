import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { CefrBadge } from "@/components/vocabulary/cefr-badge";
import { SpeakButton } from "@/components/vocabulary/speak-button";
import { WordActions } from "@/components/vocabulary/word-actions";
import type { Vocabulary } from "@/lib/types";

export default async function WordDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("vocabulary")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();
  const word = data as Vocabulary;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Button
        variant="ghost"
        size="sm"
        nativeButton={false}
        render={<Link href="/vocabulary" />}
      >
        <ArrowLeft className="size-4" />
        Vocabulaire
      </Button>

      <div className="rounded-xl border bg-card p-6">
        {/* En-tête : mot, IPA, écouter */}
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{word.word}</h1>
          {word.pronunciation && (
            <span className="text-sm text-muted-foreground">
              {word.pronunciation}
            </span>
          )}
          <CefrBadge level={word.cefr_level} />
          <div className="ml-auto">
            <SpeakButton text={word.word} />
          </div>
        </div>

        {/* Définitions */}
        <dl className="mt-5 space-y-3 text-sm">
          {word.english_definition && (
            <div>
              <dt className="text-xs font-medium text-muted-foreground">EN</dt>
              <dd>{word.english_definition}</dd>
            </div>
          )}
          {word.french_translation && (
            <div>
              <dt className="text-xs font-medium text-muted-foreground">
                Traduction
              </dt>
              <dd>{word.french_translation}</dd>
            </div>
          )}
          {word.french_definition && (
            <div>
              <dt className="text-xs font-medium text-muted-foreground">FR</dt>
              <dd>{word.french_definition}</dd>
            </div>
          )}
          {word.example_sentence && (
            <div>
              <dt className="text-xs font-medium text-muted-foreground">
                Exemple
              </dt>
              <dd className="italic text-muted-foreground">
                “{word.example_sentence}”
              </dd>
            </div>
          )}
        </dl>

        {/* Synonymes */}
        {word.synonyms.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {word.synonyms.map((s) => (
              <span
                key={s}
                className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Maîtrise */}
        <div className="mt-6">
          <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>Maîtrise</span>
            <span>{word.mastery_score}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-info"
              style={{ width: `${word.mastery_score}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6">
          <WordActions id={word.id} />
        </div>
      </div>
    </div>
  );
}
