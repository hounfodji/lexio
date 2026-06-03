"use client";

import { useState } from "react";
import { Volume2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// Lecture de la prononciation via la Web Speech API du navigateur (F5.2).
export function SpeakButton({ text }: { text: string }) {
  const [speaking, setSpeaking] = useState(false);

  function speak() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.error("La synthèse vocale n'est pas disponible sur ce navigateur.");
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.rate = 0.95;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={speak}
      aria-label={`Écouter la prononciation de ${text}`}
      data-speaking={speaking}
    >
      <Volume2 className="size-5" />
    </Button>
  );
}
