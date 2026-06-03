import { createClient } from "@/lib/supabase/server";
import { AddWordForm } from "@/components/vocabulary/add-word-form";
import { WordListItem } from "@/components/vocabulary/word-list-item";
import type { Vocabulary } from "@/lib/types";

export default async function VocabularyPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vocabulary")
    .select("*")
    .order("created_at", { ascending: false });

  const words = (data ?? []) as Vocabulary[];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Vocabulaire</h1>
        <p className="text-sm text-muted-foreground">
          {words.length} mot{words.length > 1 ? "s" : ""} dans ta collection.
        </p>
      </div>

      <AddWordForm />

      {words.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Aucun mot pour l’instant. Ajoute ton premier mot anglais ci-dessus —
            l’IA s’occupe du reste.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {words.map((word) => (
            <WordListItem key={word.id} word={word} />
          ))}
        </div>
      )}
    </div>
  );
}
