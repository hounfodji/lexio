"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getTtsPrefs, setTtsPrefs } from "@/lib/tts/preferences";
import {
  defaultEngine,
  defaultVoice,
  isValidVoice,
  type TtsEngine,
} from "@/lib/tts/engines";
import { isHdVoiceEnabled } from "@/lib/tts/feature-flag";

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
  ariaLabel,
}: {
  text: string;
  variant?: "outline" | "ghost";
  ariaLabel?: string;
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
    // HD coupée (prod) → on prend toujours la voix native, même si l'utilisateur
    // avait activé HD côté localStorage avant la désactivation.
    if (!isHdVoiceEnabled()) {
      speakNative(text);
      return;
    }

    const prefs = getTtsPrefs();
    const engine = (prefs.engine || defaultEngine()) as TtsEngine | null;

    // Voix HD activée et moteur supporté → tente le HD, sinon repli natif.
    if (prefs.hdEnabled && engine) {
      // Voix invalide pour le moteur courant (ex. ID Piper laissé après un
      // changement de moteur) → on remet la voix par défaut et on purge prefs.
      let voice = prefs.voice;
      if (!voice || !isValidVoice(engine, voice)) {
        voice = defaultVoice(engine);
        setTtsPrefs({ ...prefs, engine, voice });
      }

      setBusy(true);
      try {
        const { speakHd } = await import("@/lib/tts/hd-tts");
        await speakHd(engine, text, voice);
      } catch (err) {
        console.error("[Lexio TTS]", { engine, voice, error: err });
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
      aria-label={ariaLabel ?? `Écouter : ${text}`}
    >
      {busy ? (
        <Loader2 className="size-5 animate-spin" />
      ) : (
        <Volume2 className="size-5" />
      )}
    </Button>
  );
}
