"use client";

import type { TtsEngine } from "@/lib/tts/engines";

export type TtsPhase = "idle" | "loading" | "ready" | "speaking" | "error";

export interface TtsState {
  phase: TtsPhase;
  progress: number; // 0..100 (téléchargement du modèle)
  engine?: TtsEngine;
  error?: string;
}

type Pending = { resolve: (v: ArrayBuffer) => void; reject: (e: Error) => void };

let worker: Worker | null = null;
let loadedEngine: TtsEngine | null = null;
let loadedVoice = "";
let seq = 0;
const pendingSpeak = new Map<number, Pending>();
let pendingLoad: { resolve: () => void; reject: (e: Error) => void } | null = null;

let state: TtsState = { phase: "idle", progress: 0 };
const listeners = new Set<(s: TtsState) => void>();

function setState(patch: Partial<TtsState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l(state));
}

export function subscribe(cb: (s: TtsState) => void): () => void {
  listeners.add(cb);
  cb(state);
  return () => listeners.delete(cb);
}

export function getTtsState(): TtsState {
  return state;
}

function ensureWorker(): Worker {
  if (worker) return worker;
  worker = new Worker(new URL("./worker.ts", import.meta.url), {
    type: "module",
  });
  worker.onmessage = (e: MessageEvent) => {
    const m = e.data;
    if (m.type === "progress") {
      setState({ phase: "loading", progress: m.value });
    } else if (m.type === "ready") {
      setState({ phase: "ready", progress: 100 });
      pendingLoad?.resolve();
      pendingLoad = null;
    } else if (m.type === "audio") {
      const p = pendingSpeak.get(m.id);
      pendingSpeak.delete(m.id);
      p?.resolve(m.wav as ArrayBuffer);
      setState({ phase: "ready" });
    } else if (m.type === "error") {
      const err = new Error(m.message ?? "Erreur TTS.");
      if (m.id != null) {
        const p = pendingSpeak.get(m.id);
        pendingSpeak.delete(m.id);
        p?.reject(err);
      } else {
        pendingLoad?.reject(err);
        pendingLoad = null;
      }
      setState({ phase: "error", error: err.message });
    }
  };
  worker.onerror = (e) => {
    const err = new Error(e.message || "Erreur du worker TTS.");
    pendingLoad?.reject(err);
    pendingLoad = null;
    pendingSpeak.forEach((p) => p.reject(err));
    pendingSpeak.clear();
    setState({ phase: "error", error: err.message });
  };
  return worker;
}

function withTimeout<T>(
  p: Promise<T>,
  ms: number,
  onTimeout: () => void,
  label: string,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      onTimeout();
      reject(new Error(`Délai dépassé (${label}).`));
    }, ms);
    p.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });
}

// Charge le modèle si nécessaire (résout sur "ready").
export async function loadHd(engine: TtsEngine, voice: string): Promise<void> {
  const sameVoiceOk = engine === "kokoro" || loadedVoice === voice;
  if (loadedEngine === engine && sameVoiceOk && state.phase === "ready") return;

  const w = ensureWorker();
  setState({ phase: "loading", progress: 0, engine, error: undefined });
  await withTimeout(
    new Promise<void>((resolve, reject) => {
      pendingLoad = { resolve, reject };
      w.postMessage({ type: "load", engine, voice });
    }),
    300_000, // 5 min max pour le téléchargement initial du modèle
    () => {
      pendingLoad = null;
      setState({ phase: "error", error: "Téléchargement trop long." });
    },
    "téléchargement du modèle",
  );
  loadedEngine = engine;
  loadedVoice = voice;
}

// Génère puis joue l'audio HD. Lève en cas d'échec (le bouton fait alors le
// repli sur SpeechSynthesis).
export async function speakHd(
  engine: TtsEngine,
  text: string,
  voice: string,
): Promise<void> {
  await loadHd(engine, voice);
  const w = ensureWorker();
  setState({ phase: "speaking" });

  const id = ++seq;
  const wav = await withTimeout(
    new Promise<ArrayBuffer>((resolve, reject) => {
      pendingSpeak.set(id, { resolve, reject });
      w.postMessage({ type: "speak", id, text, voice });
    }),
    60_000, // 1 min max pour générer l'audio d'un mot/phrase
    () => {
      pendingSpeak.delete(id);
      setState({ phase: "error", error: "Génération trop longue." });
    },
    "génération audio",
  );

  const url = URL.createObjectURL(new Blob([wav], { type: "audio/wav" }));
  const audio = new Audio(url);
  audio.addEventListener("ended", () => URL.revokeObjectURL(url), { once: true });
  await audio.play();
}
