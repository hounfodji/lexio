"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PROVIDERS, PROVIDER_IDS, type ProviderId } from "@/lib/ai/providers";
import {
  saveAISettings,
  clearAISettings,
  type SettingsState,
} from "@/app/(app)/settings/actions";

interface Props {
  initialProvider: ProviderId | "";
  initialModel: string;
  hasKey: boolean;
}

export function AISettingsForm({
  initialProvider,
  initialModel,
  hasKey,
}: Props) {
  const [provider, setProvider] = useState<ProviderId>(
    initialProvider || "mistral",
  );
  const [state, formAction, pending] = useActionState<SettingsState, FormData>(
    saveAISettings,
    {},
  );
  const [clearing, startClear] = useTransition();

  useEffect(() => {
    if (state.success) toast.success("Réglages IA enregistrés.");
  }, [state]);

  const cfg = PROVIDERS[provider];

  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="provider">Fournisseur</Label>
          <select
            id="provider"
            name="provider"
            value={provider}
            onChange={(e) => setProvider(e.target.value as ProviderId)}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          >
            {PROVIDER_IDS.map((id) => (
              <option key={id} value={id}>
                {PROVIDERS[id].label}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">{cfg.hint}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="api_key">Clé API</Label>
          <Input
            id="api_key"
            name="api_key"
            type="password"
            autoComplete="off"
            placeholder={
              hasKey ? "•••••••• (clé enregistrée — laisse vide pour garder)" : "Colle ta clé…"
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="model">Modèle (optionnel)</Label>
          <Input
            id="model"
            name="model"
            defaultValue={initialModel}
            placeholder={cfg.defaultModel}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
          />
        </div>

        {state.error && (
          <p role="alert" className="text-sm text-destructive">
            {state.error}
          </p>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Enregistrement…" : "Enregistrer"}
          </Button>
          {hasKey && (
            <Button
              type="button"
              variant="outline"
              disabled={clearing}
              onClick={() =>
                startClear(async () => {
                  const res = await clearAISettings();
                  if (res?.error) toast.error(res.error);
                  else toast.success("Retour à la clé par défaut.");
                })
              }
            >
              Utiliser la clé par défaut
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
