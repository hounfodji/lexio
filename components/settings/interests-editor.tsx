"use client";

import { useActionState, useEffect, useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { INTERESTS } from "@/lib/interests";
import { updateInterests, type SettingsState } from "@/app/(app)/settings/actions";

export function InterestsEditor({ initial }: { initial: string[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initial));
  const [state, formAction, pending] = useActionState<SettingsState, FormData>(
    updateInterests,
    {},
  );

  useEffect(() => {
    if (state.success) toast.success("Intérêts mis à jour.");
  }, [state]);

  function toggle(interest: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(interest)) next.delete(interest);
      else next.add(interest);
      return next;
    });
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {INTERESTS.map((interest) => {
          const active = selected.has(interest);
          return (
            <label
              key={interest}
              className={cn(
                "flex cursor-pointer items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition-colors",
                active
                  ? "border-transparent bg-info text-info-foreground"
                  : "border-border text-muted-foreground hover:bg-accent",
              )}
            >
              <input
                type="checkbox"
                name="interest"
                value={interest}
                checked={active}
                onChange={() => toggle(interest)}
                className="sr-only"
              />
              {active && <Check className="size-3.5" aria-hidden />}
              {interest}
            </label>
          );
        })}
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending || selected.size < 1}>
        {pending ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </form>
  );
}
