import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/(auth)/actions";
import { InterestsEditor } from "@/components/settings/interests-editor";
import { ThemeSelector } from "@/components/settings/theme-selector";
import { Button } from "@/components/ui/button";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: interests } = await supabase
    .from("user_interests")
    .select("interest")
    .order("interest", { ascending: true });

  const initial = (interests ?? []).map((i) => i.interest);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">Réglages</h1>

      <section className="space-y-3">
        <div>
          <h2 className="font-medium">Centres d&apos;intérêt</h2>
          <p className="text-sm text-muted-foreground">
            Ils personnalisent tes histoires générées.
          </p>
        </div>
        <InterestsEditor initial={initial} />
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="font-medium">Thème</h2>
          <p className="text-sm text-muted-foreground">
            Clair, sombre ou selon ton système.
          </p>
        </div>
        <ThemeSelector />
      </section>

      <section className="space-y-3 border-t pt-6">
        <div>
          <h2 className="font-medium">Compte</h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
        <form action={signOut}>
          <Button type="submit" variant="outline">
            <LogOut className="size-4" />
            Se déconnecter
          </Button>
        </form>
      </section>
    </div>
  );
}
