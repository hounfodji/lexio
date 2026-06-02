import { createClient } from "@/lib/supabase/server";

// Placeholder — étoffé en Phase 3 (cartes stats, streak, CTA).
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">
        Tableau de bord
      </h1>
      <p className="text-sm text-muted-foreground">
        Bienvenue, {user?.email}. Ton tableau de bord arrive bientôt.
      </p>
    </div>
  );
}
