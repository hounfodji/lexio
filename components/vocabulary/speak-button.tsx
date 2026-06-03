"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getTtsPrefs } from "@/lib/tts/preferences";
import { detectEngine, defaultVoice } from "@/lib/tts/engines";

// Lecture native (Web Speech API) — défaut et fallback ultime (F5.2).
function speakNative(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    toast.error("La synthèse vocale n'est pas disponible sur ce navigateur.");
    return;
  }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";
  utter.rate = 0.95;
  window.speechSynthesis.speak(utter);
}

export function SpeakButton({
  text,
  variant = "outline",
}: {
  text: string;
  variant?: "outline" | "ghost";
}) {
  const [busy, setBusy] = useState(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  async function handleClick() {
    const prefs = getTtsPrefs();
    const engine = detectEngine();

    // Voix HD activée et moteur supporté → tente le HD, sinon repli natif.
    if (prefs.hdEnabled && engine) {
      setBusy(true);
      try {
        const { speakHd } = await import("@/lib/tts/hd-tts");
        await speakHd(engine, text, prefs.voice || defaultVoice(engine));
      } catch {
        toast.message("Voix HD indisponible — lecture standard.");
        speakNative(text);
      } finally {
        if (mounted.current) setBusy(false);
      }
      return;
    }

    speakNative(text);
  }

  return (
    <Button
      type="button"
      variant={variant}
      size="icon"
      onClick={handleClick}
      disabled={busy}
      aria-label={`Écouter : ${text}`}
    >
      {busy ? (
        <Loader2 className="size-5 animate-spin" />
      ) : (
        <Volume2 className="size-5" />
      )}
    </Button>
  );
}
