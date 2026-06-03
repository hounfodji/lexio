// Préférence TTS « Voix HD », stockée localement (par appareil) — cohérent
// avec le modèle neuronal téléchargé/caché sur chaque appareil.

export interface TtsPrefs {
  hdEnabled: boolean;
  voice: string; // id de voix (selon le moteur détecté)
}

const KEY = "lexio.tts";

export function getTtsPrefs(): TtsPrefs {
  if (typeof window === "undefined") return { hdEnabled: false, voice: "" };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { hdEnabled: false, voice: "" };
    const parsed = JSON.parse(raw) as Partial<TtsPrefs>;
    return { hdEnabled: Boolean(parsed.hdEnabled), voice: parsed.voice ?? "" };
  } catch {
    return { hdEnabled: false, voice: "" };
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
