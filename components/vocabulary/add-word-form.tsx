"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AddWordForm() {
  const [word, setWord] = useState("");
  const [loading, setLoading] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();

  async function submit(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      const res = await fetch("/api/generate-word", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: trimmed }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 201) {
        toast.success(`« ${trimmed} » ajouté à ton vocabulaire.`);
        setWord("");
        startTransition(() => router.refresh());
      } else if (res.status === 409) {
        toast.warning(data.error ?? "Ce mot est déjà dans ta liste.");
      } else {
        toast.error(data.error ?? "La génération a échoué.", {
          action: { label: "Réessayer", onClick: () => submit(trimmed) },
        });
      }
    } catch {
      toast.error("Erreur réseau.", {
        action: { label: "Réessayer", onClick: () => submit(trimmed) },
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit(word);
      }}
      className="flex gap-2"
    >
      <Input
        value={word}
        onChange={(e) => setWord(e.target.value)}
        placeholder="Un mot anglais… (ex: heretic)"
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        disabled={loading}
        aria-label="Mot anglais à ajouter"
      />
      <Button type="submit" disabled={loading || !word.trim()}>
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Plus className="size-4" />
        )}
        {loading ? "Génération…" : "Générer"}
      </Button>
    </form>
  );
}
