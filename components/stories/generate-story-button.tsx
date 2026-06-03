"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function GenerateStoryButton({ disabled }: { disabled?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();

  async function generate() {
    setLoading(true);
    try {
      const res = await fetch("/api/generate-story", { method: "POST" });
      const data = await res.json().catch(() => ({}));

      if (res.status === 201) {
        toast.success("Nouvelle histoire générée ✨");
        startTransition(() => router.refresh());
      } else if (res.status === 400) {
        toast.warning(data.error ?? "Ajoute d'abord des mots.");
      } else {
        toast.error(data.error ?? "La génération a échoué.", {
          action: { label: "Réessayer", onClick: generate },
        });
      }
    } catch {
      toast.error("Erreur réseau.", {
        action: { label: "Réessayer", onClick: generate },
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={generate} disabled={loading || disabled} size="lg">
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Sparkles className="size-4" />
      )}
      {loading ? "Génération…" : "Générer une histoire"}
    </Button>
  );
}
