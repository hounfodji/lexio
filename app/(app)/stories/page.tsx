import { MousePointerClick } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { GenerateStoryButton } from "@/components/stories/generate-story-button";
import { StoryContent } from "@/components/stories/story-content";
import type { StoryHistory, Vocabulary } from "@/lib/types";

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default async function StoriesPage() {
  const supabase = await createClient();

  const [{ data: stories }, { data: vocab }] = await Promise.all([
    supabase
      .from("story_history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase.from("vocabulary").select("id, word"),
  ]);

  const list = (stories ?? []) as StoryHistory[];
  const wordMap: Record<string, string> = {};
  for (const w of (vocab ?? []) as Pick<Vocabulary, "id" | "word">[]) {
    wordMap[w.word.toLowerCase()] = w.id;
  }
  const hasWords = (vocab ?? []).length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Histoires</h1>
          <p className="text-sm text-muted-foreground">
            Tes mots, racontés dans une histoire qui te ressemble.
          </p>
        </div>
        <GenerateStoryButton disabled={!hasWords} />
      </div>

      {!hasWords && (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Ajoute d&apos;abord quelques mots à ton vocabulaire pour générer une
          histoire.
        </div>
      )}

      {list.length === 0 && hasWords && (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Aucune histoire pour l&apos;instant. Clique sur « Générer une
          histoire » — l&apos;IA tisse un récit autour de tes mots non
          maîtrisés et de tes centres d&apos;intérêt.
        </div>
      )}

      <div className="space-y-4">
        {list.map((story) => (
          <article key={story.id} className="rounded-xl border bg-card p-6">
            <header className="mb-3">
              <h2 className="text-lg font-semibold">{story.title}</h2>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>{dateFmt.format(new Date(story.created_at))}</span>
                {story.interests_used.length > 0 && (
                  <>
                    <span aria-hidden>·</span>
                    <span>Thème : {story.interests_used.join(", ")}</span>
                  </>
                )}
              </div>
            </header>

            <div className="text-sm text-foreground/90">
              <StoryContent content={story.content} wordMap={wordMap} />
            </div>

            <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
              <MousePointerClick className="size-3.5" />
              Touche un mot surligné pour ouvrir sa fiche.
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
