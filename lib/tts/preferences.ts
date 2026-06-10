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

// Marqueur "modèle déjà téléchargé une fois" — sert juste à distinguer dans
// l'UI un vrai téléchargement (~80 Mo) d'une init depuis le cache navigateur
// (Cache API pour Kokoro/transformers.js, IndexedDB pour Piper). Pas de garantie
// stricte : si le navigateur évince le cache, on re-téléchargera réellement.
const CACHE_KEY = "lexio.tts.cached";

export function isModelCached(engine: TtsEngine): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return false;
    const list = JSON.parse(raw) as unknown;
    return Array.isArray(list) && list.includes(engine);
  } catch {
    return false;
  }
}

export function markModelCached(engine: TtsEngine): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    const list = raw ? (JSON.parse(raw) as unknown) : [];
    const arr = Array.isArray(list) ? (list as string[]) : [];
    if (!arr.includes(engine)) {
      arr.push(engine);
      window.localStorage.setItem(CACHE_KEY, JSON.stringify(arr));
    }
  } catch {
    // ignore
  }
}
