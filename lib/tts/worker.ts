/// <reference lib="webworker" />
// Worker d'inférence TTS HD. Importe le moteur en lazy selon les capacités.
// onnxruntime-web bascule automatiquement en mono-thread si SharedArrayBuffer
// est indisponible → aucun en-tête COOP/COEP requis.

import { KOKORO_MODEL, type TtsEngine } from "@/lib/tts/engines";

type InMessage =
  | { type: "load"; engine: TtsEngine; voice: string }
  | { type: "speak"; id: number; text: string; voice: string };

const ctx = self as unknown as DedicatedWorkerGlobalScope;

// État du worker (une instance par moteur).
let engine: TtsEngine | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let kokoro: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let piper: any = null;
let piperVoice = ""; // dernière voix préchargée (OPFS)

function postProgress(value: number) {
  ctx.postMessage({ type: "progress", value: Math.max(0, Math.min(100, value)) });
}

// Normalise les divers formats de callback de progression en pourcentage.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toPct(p: any): number | null {
  if (typeof p === "number") return p <= 1 ? p * 100 : p;
  if (p && typeof p === "object") {
    if (typeof p.progress === "number") return p.progress <= 1 ? p.progress * 100 : p.progress;
    if (typeof p.loaded === "number" && typeof p.total === "number" && p.total > 0) {
      return (p.loaded / p.total) * 100;
    }
  }
  return null;
}

async function loadKokoro() {
  const { KokoroTTS } = await import("kokoro-js");
  // WASM q8 : fiable dans un Web Worker (WebGPU+q8 peut se figer). ~80 Mo.
  kokoro = await KokoroTTS.from_pretrained(KOKORO_MODEL, {
    dtype: "q8",
    device: "wasm",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    progress_callback: (p: any) => {
      const pct = toPct(p);
      if (pct !== null) postProgress(pct);
    },
  });
}

// Piper : on N'UTILISE PAS TtsSession (singleton qui fige la 1re voix). On
// précharge le modèle de la voix demandée (download → OPFS) ; la génération
// passe par predict({ text, voiceId }), stateless, qui respecte la voix.
async function loadPiper(voice: string) {
  if (!piper) piper = await import("@mintplex-labs/piper-tts-web");
  if (piperVoice !== voice) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await piper.download(voice, (p: any) => {
      const pct = toPct(p);
      if (pct !== null) postProgress(pct);
    });
    piperVoice = voice;
  }
}

async function ensureLoaded(target: TtsEngine, voice: string) {
  if (target === "kokoro") {
    if (!kokoro) await loadKokoro();
  } else {
    await loadPiper(voice);
  }
  engine = target;
}

async function speak(text: string, voice: string): Promise<ArrayBuffer> {
  if (engine === "kokoro") {
    const audio = await kokoro.generate(text, { voice });
    const blob: Blob = await audio.toBlob();
    return blob.arrayBuffer();
  }
  // Piper : génération stateless avec la voix courante.
  await loadPiper(voice);
  const blob: Blob = await piper.predict({ text, voiceId: voice });
  return blob.arrayBuffer();
}

ctx.onmessage = async (e: MessageEvent<InMessage>) => {
  const msg = e.data;
  try {
    if (msg.type === "load") {
      await ensureLoaded(msg.engine, msg.voice);
      ctx.postMessage({ type: "ready" });
    } else if (msg.type === "speak") {
      await ensureLoaded(engine ?? "piper", msg.voice);
      const wav = await speak(msg.text, msg.voice);
      ctx.postMessage({ type: "audio", id: msg.id, wav }, [wav]);
    }
  } catch (err) {
    ctx.postMessage({
      type: "error",
      id: msg.type === "speak" ? msg.id : undefined,
      message: err instanceof Error ? err.message : "Erreur TTS.",
    });
  }
};
