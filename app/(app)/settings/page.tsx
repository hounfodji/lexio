import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/(auth)/actions";
import { InterestsEditor } from "@/components/settings/interests-editor";
import { ProfileForm } from "@/components/settings/profile-form";
import { ThemeSelector } from "@/components/settings/theme-selector";
import { AISettingsForm } from "@/components/settings/ai-settings-form";
import { VoiceSettings } from "@/components/settings/voice-settings";
import { isHdVoiceEnabled } from "@/lib/tts/feature-flag";
import { isProviderId, type ProviderId } from "@/lib/ai/providers";
import { Button } from "@/components/ui/button";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: interests }, { data: aiRow }, { data: profile }] = await Promise.all([
    supabase
      .from("user_interests")
      .select("interest")
      .order("interest", { ascending: true }),
    supabase
      .from("user_ai_settings")
      .select("provider, model, api_key_cipher")
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("username")
      .eq("id", user?.id ?? "")
      .maybeSingle(),
  ]);

  const initial = (interests ?? []).map((i) => i.interest);

  // On ne renvoie jamais le cipher au client : seulement provider/model/hasKey.
  const aiProvider: ProviderId | "" =
    aiRow && isProviderId(aiRow.provider) ? aiRow.provider : "";
  const aiModel = aiRow?.model ?? "";
  const hasKey = Boolean(aiRow?.api_key_cipher);
  const initialUsername =
    profile?.username || user?.email?.split("@")[0] || "";

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">Réglages</h1>

      <section className="space-y-3">
        <div>
          <h2 className="font-medium">Profil</h2>
          <p className="text-sm text-muted-foreground">
            Ton nom d&apos;affichage et ton mot de passe.
          </p>
        </div>
        <ProfileForm initialUsername={initialUsername} />
      </section>

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
          <h2 className="font-medium">Clé API IA</h2>
          <p className="text-sm text-muted-foreground">
            Branche ta propre clé (gratuite chez la plupart des fournisseurs).
            Sans clé perso, le fournisseur par défaut du serveur est utilisé.
          </p>
        </div>
        <AISettingsForm
          initialProvider={aiProvider}
          initialModel={aiModel}
          hasKey={hasKey}
        />
      </section>

      {isHdVoiceEnabled() && (
        <section className="space-y-3">
          <div>
            <h2 className="font-medium">Voix</h2>
            <p className="text-sm text-muted-foreground">
              Active une voix neuronale haute qualité, exécutée dans ton
              navigateur (gratuite, sans serveur).
            </p>
          </div>
          <VoiceSettings />
        </section>
      )}

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
