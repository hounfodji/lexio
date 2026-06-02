import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Déjà onboardé → dashboard.
  const { count } = await supabase
    .from("user_interests")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (count) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Choisis tes intérêts
          </h1>
          <p className="text-sm text-muted-foreground">
            Au moins 1, idéalement 3. Tes histoires seront tissées autour de ces
            thèmes.
          </p>
        </div>
        <OnboardingForm />
      </div>
    </div>
  );
}
