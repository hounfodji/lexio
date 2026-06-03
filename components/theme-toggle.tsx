"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  // Pattern next-themes : on attend le montage client avant de lire le thème.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  // Pré-montage (serveur + 1er rendu client), on rend exactement le même
  // markup neutre : pas de `disabled`, label/icône stables → aucun mismatch.
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={
        !mounted
          ? "Changer de thème"
          : isDark
            ? "Passer en thème clair"
            : "Passer en thème sombre"
      }
      onClick={
        mounted ? () => setTheme(isDark ? "light" : "dark") : undefined
      }
    >
      {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </Button>
  );
}
