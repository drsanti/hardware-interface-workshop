import { SlidersHorizontal } from "lucide-react";

import { Panel } from "@/components/lab/Panel";
import { cn } from "@/lib/cn";
import type { BiquadKind } from "@/lib/pcm/biquad";

const KINDS: { id: BiquadKind; label: string }[] = [
  { id: "bypass", label: "Bypass" },
  { id: "lowpass", label: "Low-pass" },
  { id: "highpass", label: "High-pass" },
  { id: "bandpass", label: "Band-pass" },
];

type Props = {
  micSupported: boolean;
  ready: boolean;
  portOpen: boolean;
  streaming: boolean;
  filterKind: BiquadKind;
  cutoffHz: number;
  q: number;
  monitor: boolean;
  volume: number;
  filterMessage: string | null;
  onKind: (k: BiquadKind) => void;
  onCutoff: (hz: number) => void;
  onQ: (q: number) => void;
  onMonitor: (on: boolean) => void;
  onVolume: (v: number) => void;
};

/** Biquad controls for live MicPcm (ex29). */
export function FilterCard({
  micSupported,
  ready,
  portOpen,
  streaming,
  filterKind,
  cutoffHz,
  q,
  monitor,
  volume,
  filterMessage,
  onKind,
  onCutoff,
  onQ,
  onMonitor,
  onVolume,
}: Props) {
  const live = portOpen && ready && micSupported;
  const filtered = filterKind !== "bypass";

  const hint = !micSupported
    ? "No mic on this board target — switch to es3c28p."
    : !portOpen
      ? "Connect over USB first."
      : !ready
        ? "Waiting for the board to settle…"
        : !streaming
          ? "Turn on Stream PCM (or Monitor — it starts stream)."
          : "Sweep cutoff while speaking — watch the FFT and listen.";

  return (
    <Panel>
      <div className="flex items-center gap-2 text-sm font-medium">
        <SlidersHorizontal className="size-4 text-serial" aria-hidden />
        Biquad filter
      </div>
      <p className="text-sm text-muted">{hint}</p>

      <div className="flex flex-wrap justify-center gap-2">
        {KINDS.map((k) => (
          <button
            key={k.id}
            type="button"
            disabled={!live}
            onClick={() => onKind(k.id)}
            className={cn(
              "rounded-md border px-3 py-2 text-sm",
              filterKind === k.id
                ? "border-serial/50 bg-serial/15 text-white"
                : "border-line text-muted hover:border-muted hover:text-white",
              "disabled:cursor-not-allowed disabled:opacity-40",
            )}
          >
            {k.label}
          </button>
        ))}
      </div>

      <label className="grid grid-cols-[4.5rem_1fr_3.5rem] items-center gap-3">
        <span className="text-xs font-medium text-muted">Cutoff</span>
        <input
          type="range"
          min={80}
          max={7000}
          step={10}
          value={cutoffHz}
          disabled={!live || !filtered}
          onChange={(e) => onCutoff(Number(e.target.value))}
          className="w-full disabled:opacity-40"
          style={{ accentColor: "#a371f7" }}
        />
        <span className="font-mono text-xs text-muted">{cutoffHz} Hz</span>
      </label>

      <label className="grid grid-cols-[4.5rem_1fr_3.5rem] items-center gap-3">
        <span className="text-xs font-medium text-muted">Q</span>
        <input
          type="range"
          min={0.3}
          max={8}
          step={0.05}
          value={q}
          disabled={!live || !filtered}
          onChange={(e) => onQ(Number(e.target.value))}
          className="w-full disabled:opacity-40"
          style={{ accentColor: "#a371f7" }}
        />
        <span className="font-mono text-xs text-muted">{q.toFixed(2)}</span>
      </label>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          disabled={!live}
          onClick={() => onMonitor(!monitor)}
          className={cn(
            "rounded-md border px-3 py-2 text-sm",
            monitor
              ? "border-accent/50 bg-accent/15 text-accent"
              : "border-line text-muted hover:border-muted hover:text-white",
            "disabled:cursor-not-allowed disabled:opacity-40",
          )}
        >
          {monitor ? "Monitor on" : "Monitor off"}
        </button>
        <label className="grid grid-cols-[3rem_8rem_2.5rem] items-center gap-2">
          <span className="text-xs font-medium text-muted">Vol</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            disabled={!live || !monitor}
            onChange={(e) => onVolume(Number(e.target.value))}
            className="w-full disabled:opacity-40"
            style={{ accentColor: "#3fb950" }}
          />
          <span className="font-mono text-xs text-muted">{Math.round(volume * 100)}%</span>
        </label>
      </div>

      <p className="min-h-5 text-center text-sm text-muted">{filterMessage}</p>
    </Panel>
  );
}
