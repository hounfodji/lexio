import Link from "next/link";
import { Flame, Plus, Sparkles, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getDashboardStats } from "@/lib/stats";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [stats, profileRes] = await Promise.all([
    user
      ? getDashboardStats(supabase, user.id)
      : Promise.resolve({ total: 0, mastered: 0, learning: 0, dueToday: 0, streak: 0 }),
    user
      ? supabase.from("profiles").select("username").eq("id", user.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const name =
    profileRes.data?.username || user?.email?.split("@")[0] || "toi";

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          Bonjour, <span className="capitalize">{name}</span>
        </h1>
        {stats.streak > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-warning-muted px-3 py-1 text-sm font-medium text-warning">
            <Flame className="size-4" />
            {stats.streak} j
          </span>
        )}
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Maîtrisés" value={stats.mastered} accent="success" />
        <StatCard label="En cours" value={stats.learning} accent="info" />
        <StatCard label="Dus aujourd'hui" value={stats.dueToday} accent="warning" />
      </div>

      {/* CTA Réviser */}
      {stats.dueToday > 0 ? (
        <Button
          size="lg"
          className="w-full"
          nativeButton={false}
          render={<Link href="/review" />}
        >
          <BookOpen className="size-4" />
          Réviser maintenant ({stats.dueToday})
        </Button>
      ) : (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          {stats.total === 0
            ? "Commence par ajouter quelques mots à ton vocabulaire."
            : "Aucune révision due aujourd'hui. Reviens plus tard 👌"}
        </div>
      )}

      {/* Accès rapides */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Button
          variant="outline"
          size="lg"
          className="w-full justify-start"
          nativeButton={false}
          render={<Link href="/vocabulary" />}
        >
          <Plus className="size-4" />
          Ajouter un mot
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="w-full justify-start"
          nativeButton={false}
          render={<Link href="/stories" />}
        >
          <Sparkles className="size-4" />
          Générer une histoire
        </Button>
      </div>
    </div>
  );
}
