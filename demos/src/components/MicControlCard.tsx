import { Mic, MicOff } from "lucide-react";

import { Panel } from "@/components/lab/Panel";
import { cn } from "@/lib/cn";
import { levelToPercent, type AudioLevelView } from "@/lib/wire/mic";

export type MicCardFeatures = {
  vu?: boolean;
  gain?: boolean;
  wave?: boolean;
  /** Show Stream PCM without the waveform strip (e.g. FFT lab). */
  stream?: boolean;
};

type Props = {
  micSupported: boolean;
  ready: boolean;
  portOpen: boolean;
  enabled: boolean;
  muted: boolean;
  streaming: boolean;
  gainPct: number;
  level: AudioLevelView | null;
  waveform: Float32Array;
  micMessage: string | null;
  features?: MicCardFeatures;
  onEnable: (on: boolean) => void;
  onMute: (on: boolean) => void;
  onStream: (on: boolean) => void;
  onGain: (n: number) => void;
  onApplyGain: () => void;
};

function VuBar({ level }: { level: AudioLevelView | null }) {
  const rmsPct = levelToPercent(level?.rms ?? 0);
  const peakPct = levelToPercent(level?.peak ?? 0);
  return (
    <div className="space-y-2">
      <div className="h-4 overflow-hidden rounded-md border border-line bg-ink">
        <div
          className="h-full bg-accent transition-[width] duration-75"
          style={{ width: `${rmsPct}%` }}
        />
      </div>
      <div className="relative h-2 overflow-hidden rounded-sm border border-line/60 bg-ink">
        <div
          className="absolute top-0 h-full w-0.5 bg-warn"
          style={{ left: `${peakPct}%` }}
        />
      </div>
      <p className="text-center font-mono text-xs text-muted">
        rms {rmsPct.toFixed(0)}% · peak {peakPct.toFixed(0)}%
        {level ? ` · amp ${level.rms}/${level.peak}` : ""}
        {level?.clipped ? " · CLIP" : ""}
      </p>
    </div>
  );
}

function WaveStrip({ samples }: { samples: Float32Array }) {
  const w = 640;
  const h = 140;
  const mid = h / 2;
  /* Speech rarely reaches full-scale int16 — boost so loud talk fills ~90%. */
  let peak = 0;
  for (let i = 0; i < samples.length; i++) {
    const a = Math.abs(samples[i] ?? 0);
    if (a > peak) peak = a;
  }
  const gain = peak > 0.02 ? Math.min(10, 0.9 / peak) : 5;
  let d = `M 0 ${mid}`;
  for (let i = 0; i < samples.length; i++) {
    const x = (i / Math.max(1, samples.length - 1)) * w;
    const y = mid - (samples[i] ?? 0) * gain * (h * 0.45);
    d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return (
    <div className="space-y-1">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-36 w-full rounded-md border border-line bg-ink"
        preserveAspectRatio="none"
      >
        <line x1={0} y1={mid} x2={w} y2={mid} stroke="#30363d" strokeWidth="1" />
        <path d={d} fill="none" stroke="#3fb950" strokeWidth="1.75" />
      </svg>
      <p className="text-center font-mono text-[11px] text-muted">
        display ×{gain.toFixed(1)}
        {peak > 0 ? ` · peak ${(peak * 100).toFixed(0)}% FS` : ""}
      </p>
    </div>
  );
}

/** Progressive mic UI — labs enable features via `features`. */
export function MicControlCard({
  micSupported,
  ready,
  portOpen,
  enabled,
  muted,
  streaming,
  gainPct,
  level,
  waveform,
  micMessage,
  features = {},
  onEnable,
  onMute,
  onStream,
  onGain,
  onApplyGain,
}: Props) {
  return (
    <Panel className={micSupported ? "border-accent/30" : "border-warn/30"}>
      <div className="flex items-center gap-2 text-sm font-medium">
        <Mic className={cn("size-4", enabled ? "text-accent" : "text-muted")} aria-hidden />
        Microphone
      </div>

      {!micSupported ? (
        <p className="text-sm text-muted">
          This board target has no mic. Set{" "}
          <span className="font-mono text-xs text-serial">WORKSHOP_BOARD_ID</span> to{" "}
          <span className="font-mono text-xs text-serial">es3c28p</span>.
        </p>
      ) : !portOpen ? (
        <p className="text-sm text-muted">Connect first, then enable the mic.</p>
      ) : !ready ? (
        <p className="text-sm text-muted">Waiting for the board to settle…</p>
      ) : (
        <>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => onEnable(!enabled)}
              className={cn(
                "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm",
                enabled
                  ? "border-accent/50 bg-accent/10 text-white"
                  : "border-line text-muted hover:border-muted hover:text-white",
              )}
            >
              {enabled ? <Mic className="size-4" /> : <MicOff className="size-4" />}
              {enabled ? "Mic on" : "Mic off"}
            </button>
            {features.gain ? (
              <button
                type="button"
                onClick={() => onMute(!muted)}
                disabled={!enabled}
                className={cn(
                  "rounded-md border px-3 py-2 text-sm",
                  muted
                    ? "border-warn/50 text-warn"
                    : "border-line text-muted hover:border-muted hover:text-white",
                  "disabled:cursor-not-allowed disabled:opacity-40",
                )}
              >
                {muted ? "Unmute" : "Mute"}
              </button>
            ) : null}
            {features.wave || features.stream ? (
              <button
                type="button"
                onClick={() => onStream(!streaming)}
                className={cn(
                  "rounded-md border px-3 py-2 text-sm",
                  streaming
                    ? "border-serial/50 bg-serial/10 text-white"
                    : "border-line text-muted hover:border-muted hover:text-white",
                )}
              >
                {streaming ? "Stream on" : "Stream PCM"}
              </button>
            ) : null}
          </div>

          {!features.vu ? (
            <p className="text-center font-mono text-sm text-muted">
              {level
                ? `rms ${level.rms} · peak ${level.peak}${level.clipped ? " · CLIP" : ""}`
                : enabled
                  ? "Waiting for AudioLevel…"
                  : "Enable the mic to see levels."}
            </p>
          ) : (
            <VuBar level={enabled ? level : null} />
          )}

          {features.gain ? (
            <label className="grid grid-cols-[3.5rem_1fr_auto] items-center gap-3">
              <span className="text-xs font-medium text-muted">Gain</span>
              <input
                type="range"
                min={0}
                max={100}
                value={gainPct}
                onChange={(e) => onGain(Number(e.target.value))}
                onMouseUp={() => onApplyGain()}
                onTouchEnd={() => onApplyGain()}
                className="w-full"
                style={{ accentColor: "#3fb950" }}
              />
              <button
                type="button"
                onClick={onApplyGain}
                className="rounded-md border border-line px-2 py-1 text-xs text-muted hover:text-white"
              >
                {gainPct}%
              </button>
            </label>
          ) : null}

          {features.wave ? <WaveStrip samples={waveform} /> : null}
        </>
      )}

      <p className="min-h-5 text-center text-sm text-muted">{micMessage}</p>
    </Panel>
  );
}
