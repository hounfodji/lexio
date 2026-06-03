import type { TtsEngine } from "@/lib/tts/engines";

// Préférence TTS « Voix HD », stockée localement (par appareil) — cohérent
// avec le modèle neuronal téléchargé/caché sur chaque appareil.

export interface TtsPrefs {
  hdEnabled: boolean;
  engine: TtsEngine | "";
  voice: string; // id de voix (selon le moteur)
}

const KEY = "lexio.tts";
const EMPTY: TtsPrefs = { hdEnabled: false, engine: "", voice: "" };

export function getTtsPrefs(): TtsPrefs {
  if (typeof window === "undefined") return { ...EMPTY };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    const p = JSON.parse(raw) as Partial<TtsPrefs>;
    return {
      hdEnabled: Boolean(p.hdEnabled),
      engine: (p.engine as TtsEngine) ?? "",
      voice: p.voice ?? "",
    };
  } catch {
    return { ...EMPTY };
  }
}

export function setTtsPrefs(prefs: TtsPrefs): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    // localStorage indisponible (mode privé strict) — on ignore.
  }
}
