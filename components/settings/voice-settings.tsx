"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { getTtsPrefs, setTtsPrefs } from "@/lib/tts/preferences";
import {
  availableEngines,
  defaultEngine,
  defaultVoice,
  engineLabel,
  voicesFor,
  type TtsEngine,
} from "@/lib/tts/engines";
import { subscribe, speakHd, type TtsState } from "@/lib/tts/hd-tts";

export function VoiceSettings() {
  const [mounted, setMounted] = useState(false);
  const [engines, setEngines] = useState<TtsEngine[]>([]);
  const [engine, setEngine] = useState<TtsEngine | null>(null);
  const [hdEnabled, setHdEnabled] = useState(false);
  const [voice, setVoice] = useState("");
  const [tts, setTts] = useState<TtsState>({ phase: "idle", progress: 0 });

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const list = availableEngines();
    const prefs = getTtsPrefs();
    const eng = (prefs.engine as TtsEngine) || defaultEngine();
    setEngines(list);
    setEngine(eng);
    setHdEnabled(prefs.hdEnabled);
    setVoice(prefs.voice || (eng ? defaultVoice(eng) : ""));
    setMounted(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    return subscribe(setTts);
  }, []);

  function persist(next: Partial<{ hdEnabled: boolean; engine: TtsEngine; voice: string }>) {
    setTtsPrefs({
      hdEnabled: next.hdEnabled ?? hdEnabled,
      engine: next.engine ?? engine ?? "",
      voice: next.voice ?? voice,
    });
  }

  function toggleHd() {
    if (!engine) {
      toast.message("Voix HD non supportée ici — la voix système sera utilisée.");
      return;
    }
    setHdEnabled((v) => {
      persist({ hdEnabled: !v });
      return !v;
    });
  }

  function changeEngine(e: TtsEngine) {
    const v = defaultVoice(e);
    setEngine(e);
    setVoice(v);
    persist({ engine: e, voice: v });
  }

  function changeVoice(v: string) {
    setVoice(v);
    persist({ voice: v });
  }

  async function test() {
    if (!engine) return;
    try {
      await speakHd(engine, "Hello, this is the HD voice.", voice);
    } catch {
      toast.error("Échec de la voix HD. Réessaie ou garde la voix standard.");
    }
  }

  if (!mounted) {
    return <div className="h-24 animate-pulse rounded-lg bg-secondary" />;
  }

  const loading = tts.phase === "loading";
  const speaking = tts.phase === "speaking";
  const supported = engines.length > 0;

  return (
    <div className="space-y-4">
      {/* Interrupteur Voix HD */}
      <button
        type="button"
        onClick={toggleHd}
        aria-pressed={hdEnabled}
        className={cn(
          "flex w-full items-center justify-between rounded-lg border p-4 text-left transition-colors",
          hdEnabled ? "border-info bg-info-muted" : "border-border hover:bg-accent",
        )}
      >
        <span className="space-y-0.5">
          <span className="flex items-center gap-2 text-sm font-medium">
            <Volume2 className="size-4" /> Voix HD (neuronale, dans le navigateur)
          </span>
          <span className="block text-xs text-muted-foreground">
            {supported
              ? "Téléchargée une fois, puis fonctionne hors-ligne. Le texte ne quitte pas l'appareil."
              : "Non supportée sur ce navigateur — voix système utilisée."}
          </span>
        </span>
        <span
          className={cn(
            "grid size-5 shrink-0 place-items-center rounded-full border",
            hdEnabled ? "border-info bg-info text-info-foreground" : "border-border",
          )}
        >
          {hdEnabled && <Check className="size-3.5" />}
        </span>
      </button>

      {hdEnabled && supported && engine && (
        <div className="space-y-3">
          {/* Choix du moteur */}
          <div className="space-y-2">
            <Label>Moteur</Label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {engines.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => changeEngine(e)}
                  aria-pressed={engine === e}
                  className={cn(
                    "rounded-lg border p-3 text-left text-sm transition-colors",
                    engine === e
                      ? "border-info bg-info-muted text-info"
                      : "border-border hover:bg-accent",
                  )}
                >
                  {engineLabel(e)}
                </button>
              ))}
            </div>
          </div>

          {/* Choix de la voix */}
          <div className="space-y-2">
            <Label htmlFor="voice">Voix</Label>
            <select
              id="voice"
              value={voice}
              onChange={(e) => changeVoice(e.target.value)}
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            >
              {voicesFor(engine).map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          <Button type="button" variant="outline" onClick={test} disabled={loading || speaking}>
            {loading || speaking ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Volume2 className="size-4" />
            )}
            {loading
              ? `Téléchargement… ${Math.round(tts.progress)}%`
              : speaking
                ? "Lecture…"
                : "Tester la voix"}
          </Button>

          {loading && <Progress value={tts.progress} />}
          {tts.phase === "error" && tts.error && (
            <p className="text-sm text-destructive">{tts.error}</p>
          )}
        </div>
      )}
    </div>
  );
}
