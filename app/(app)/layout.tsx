import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/layout/app-nav";

// Layout protégé : exige une session et des centres d'intérêt définis.
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Redirige vers l'onboarding tant qu'aucun centre d'intérêt n'est choisi (F1.3).
  const { count } = await supabase
    .from("user_interests")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (!count) {
    redirect("/onboarding");
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Aller au contenu
      </a>
      <AppNav />
      <main
        id="main-content"
        className="mx-auto w-full max-w-5xl flex-1 px-4 py-6"
      >
        {children}
      </main>
    </div>
  );
}
