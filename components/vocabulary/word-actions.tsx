"use client";

import { useTransition } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { markKnown, markDifficult } from "@/app/(app)/vocabulary/[id]/actions";

export function WordActions({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  function run(kind: "known" | "difficult") {
    startTransition(async () => {
      const res =
        kind === "known" ? await markKnown(id) : await markDifficult(id);
      if (res?.error) {
        toast.error(res.error);
      } else if (kind === "known") {
        toast.success("Marqué comme connu. Bien joué !");
      } else {
        toast.info("Marqué comme difficile. À revoir bientôt.");
      }
    });
  }

  return (
    <div className="flex gap-2">
      <Button
        type="button"
        variant="outline"
        className="flex-1 text-success"
        disabled={pending}
        onClick={() => run("known")}
      >
        <Check className="size-4" />
        Connu
      </Button>
      <Button
        type="button"
        variant="outline"
        className="flex-1 text-destructive"
        disabled={pending}
        onClick={() => run("difficult")}
      >
        <X className="size-4" />
        Difficile
      </Button>
    </div>
  );
}
