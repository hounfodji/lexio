"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Clair", icon: Sun },
  { value: "dark", label: "Sombre", icon: Moon },
  { value: "system", label: "Système", icon: Monitor },
] as const;

export function ThemeSelector() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const current = mounted ? theme : undefined;

  return (
    <div className="flex gap-2" role="group" aria-label="Choix du thème">
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = current === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            aria-pressed={active}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 rounded-lg border p-3 text-sm transition-colors",
              active
                ? "border-info bg-info-muted text-info"
                : "border-border text-muted-foreground hover:bg-accent",
            )}
          >
            <Icon className="size-5" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
