// Moteurs TTS HD disponibles côté navigateur + détection de capacité.

export type TtsEngine = "kokoro" | "piper";

export interface TtsVoice {
  id: string;
  label: string;
}

export const KOKORO_MODEL = "onnx-community/Kokoro-82M-v1.0-ONNX";

export const KOKORO_VOICES: TtsVoice[] = [
  { id: "af_heart", label: "Heart — US, féminine" },
  { id: "am_michael", label: "Michael — US, masculine" },
  { id: "bf_emma", label: "Emma — UK, féminine" },
  { id: "bm_george", label: "George — UK, masculine" },
];

export const PIPER_VOICES: TtsVoice[] = [
  { id: "en_US-hfc_female-medium", label: "HFC — US, féminine" },
  { id: "en_US-hfc_male-medium", label: "HFC — US, masculine" },
  { id: "en_GB-cori-high", label: "Cori — UK, féminine" },
  { id: "en_GB-alan-medium", label: "Alan — UK, masculine" },
];

export function voicesFor(engine: TtsEngine): TtsVoice[] {
  return engine === "kokoro" ? KOKORO_VOICES : PIPER_VOICES;
}

export function defaultVoice(engine: TtsEngine): string {
  return voicesFor(engine)[0].id;
}

// Les deux moteurs tournent en WASM dans un Web Worker : disponibles dès que
// WebAssembly est supporté. L'utilisateur choisit lequel utiliser.
export function ttsSupported(): boolean {
  return typeof window !== "undefined" && typeof WebAssembly !== "undefined";
}

export function availableEngines(): TtsEngine[] {
  return ttsSupported() ? ["kokoro", "piper"] : [];
}

// Moteur par défaut proposé.
export function defaultEngine(): TtsEngine | null {
  return ttsSupported() ? "kokoro" : null;
}

export function engineLabel(engine: TtsEngine): string {
  return engine === "kokoro"
    ? "Kokoro — qualité supérieure (~80 Mo)"
    : "Piper — plus léger, compatible partout";
}
