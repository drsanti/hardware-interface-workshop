import { BrainCircuit } from "lucide-react";

import { Panel } from "@/components/lab/Panel";
import { cn } from "@/lib/cn";
import { SOUND_LABELS, type SoundLabel } from "@/lib/pcm/classify";
import type { AudioFeatures } from "@/lib/pcm/features";

const LABEL_STYLE: Record<SoundLabel, string> = {
  silence: "border-muted/40 text-muted",
  speech: "border-ble/50 bg-ble/10 text-ble",
  whistle: "border-accent/50 bg-accent/10 text-accent",
  noise: "border-warn/50 bg-warn/10 text-warn",
};

type Props = {
  features: AudioFeatures;
  label: SoundLabel;
  scores: Record<SoundLabel, number>;
  mode: "baseline" | "knn";
  counts: Record<SoundLabel, number>;
  streaming: boolean;
  classifyReady: boolean;
  micSupported: boolean;
  classifyMessage: string | null;
  onMark: (label: SoundLabel) => void;
  onClearTraining: () => void;
};

/** Live sound class + k-NN labeling (ex32). */
export function ClassifyCard({
  features,
  label,
  scores,
  mode,
  counts,
  streaming,
  classifyReady,
  micSupported,
  classifyMessage,
  onMark,
  onClearTraining,
}: Props) {
  const total = SOUND_LABELS.reduce((s, k) => s + counts[k], 0);
  const hint = !micSupported
    ? "No mic on this board target — switch to es3c28p."
    : !streaming
      ? "Turn on Stream PCM — then speak, whistle, or stay quiet."
      : !classifyReady
        ? "Starting classifier…"
        : mode === "knn"
          ? "k-NN is live — mark more examples to refine it."
          : "Baseline rules — mark ≥3 examples to enable k-NN.";

  return (
    <Panel>
      <div className="flex items-center gap-2 text-sm font-medium">
        <BrainCircuit className="size-4 text-serial" aria-hidden />
        Sound classifier
      </div>
      <p className="text-sm text-muted">{hint}</p>

      <div
        className={cn(
          "rounded-md border bg-ink px-4 py-6 text-center",
          LABEL_STYLE[label],
        )}
      >
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          prediction · {mode}
        </p>
        <p className="mt-1 font-mono text-4xl font-semibold tracking-tight capitalize">
          {label}
        </p>
        <p className="mt-2 font-mono text-[11px] text-muted">
          rms {features.rms.toFixed(3)} · zcr {features.zcr.toFixed(3)} · cen{" "}
          {features.centroidHz.toFixed(0)} Hz · flat {features.flatness.toFixed(2)}
        </p>
      </div>

      <div className="space-y-2">
        {SOUND_LABELS.map((k) => {
          const pct = Math.round((scores[k] ?? 0) * 100);
          return (
            <div key={k} className="grid grid-cols-[4.5rem_1fr_2.5rem] items-center gap-2">
              <span className="text-xs capitalize text-muted">{k}</span>
              <div className="h-2 overflow-hidden rounded-sm border border-line bg-ink">
                <div
                  className="h-full bg-serial/80 transition-[width] duration-100"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="font-mono text-[11px] text-muted">{pct}%</span>
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted">
          Mark current frame ({total} exemplars)
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {SOUND_LABELS.map((k) => (
            <button
              key={k}
              type="button"
              disabled={!streaming || !classifyReady}
              onClick={() => onMark(k)}
              className={cn(
                "rounded-md border px-3 py-2 text-sm capitalize",
                "border-line text-muted hover:border-muted hover:text-white",
                "disabled:cursor-not-allowed disabled:opacity-40",
              )}
            >
              {k}
              <span className="ml-1 font-mono text-[10px] text-muted">({counts[k]})</span>
            </button>
          ))}
        </div>
        <div className="flex justify-center">
          <button
            type="button"
            disabled={total === 0}
            onClick={onClearTraining}
            className={cn(
              "rounded-md border border-line px-3 py-1.5 text-xs text-muted",
              "hover:border-muted hover:text-white",
              "disabled:cursor-not-allowed disabled:opacity-40",
            )}
          >
            Clear training
          </button>
        </div>
      </div>

      <p className="min-h-5 text-center text-sm text-muted">{classifyMessage}</p>
    </Panel>
  );
}
