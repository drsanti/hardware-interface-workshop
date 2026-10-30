import { Music } from "lucide-react";

import { Panel } from "@/components/lab/Panel";
import { cn } from "@/lib/cn";
import type { PitchResult } from "@/lib/pcm/yin";

type Props = {
  pitch: PitchResult;
  hzHistory: Float32Array;
  sampleRate: number;
  streaming: boolean;
  pitchReady: boolean;
  micSupported: boolean;
};

function CentsNeedle({ cents }: { cents: number | null }) {
  const c = cents ?? 0;
  const clamped = Math.max(-50, Math.min(50, c));
  const pct = ((clamped + 50) / 100) * 100;
  return (
    <div className="space-y-1">
      <div className="relative h-3 overflow-hidden rounded-sm border border-line bg-ink">
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-muted" />
        <div
          className="absolute top-0 h-full w-1 rounded-sm bg-accent"
          style={{ left: `calc(${pct}% - 2px)` }}
        />
      </div>
      <p className="text-center font-mono text-[11px] text-muted">
        {cents == null ? "— cents" : `${cents >= 0 ? "+" : ""}${cents.toFixed(0)} cents`}
      </p>
    </div>
  );
}

function HzSpark({ values }: { values: Float32Array }) {
  const w = 320;
  const h = 64;
  const max = 600;
  let d = "";
  for (let i = 0; i < values.length; i++) {
    const v = values[i] ?? 0;
    const x = (i / Math.max(1, values.length - 1)) * w;
    const y = v <= 0 ? h - 2 : h - (Math.min(max, v) / max) * (h - 6) - 2;
    d += `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)} `;
  }
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-16 w-full rounded-md border border-line bg-ink"
      preserveAspectRatio="none"
    >
      <path d={d} fill="none" stroke="#58a6ff" strokeWidth="1.75" />
    </svg>
  );
}

/** Live YIN pitch readout (ex31). */
export function PitchCard({
  pitch,
  hzHistory,
  sampleRate,
  streaming,
  pitchReady,
  micSupported,
}: Props) {
  const voiced = pitch.hz != null && pitch.confidence > 0.4;
  const hint = !micSupported
    ? "No mic on this board target — switch to es3c28p."
    : !streaming
      ? "Turn on Stream PCM — whistle or hum a steady note."
      : !pitchReady
        ? "Starting YIN…"
        : voiced
          ? "Hold the pitch — needle shows cents vs equal temperament."
          : "No clear pitch — try a whistle or sung vowel.";

  return (
    <Panel>
      <div className="flex items-center gap-2 text-sm font-medium">
        <Music className="size-4 text-serial" aria-hidden />
        Pitch (YIN)
      </div>
      <p className="text-sm text-muted">{hint}</p>

      <div
        className={cn(
          "rounded-md border border-line bg-ink px-4 py-6 text-center",
          voiced && "border-accent/40",
        )}
      >
        <p className="font-mono text-5xl font-semibold tracking-tight">
          {voiced ? pitch.note : "—"}
        </p>
        <p className="mt-2 font-mono text-sm text-muted">
          {voiced
            ? `${pitch.hz!.toFixed(1)} Hz · conf ${(pitch.confidence * 100).toFixed(0)}% · MIDI ${pitch.midi}`
            : `rms ${pitch.rms.toFixed(3)} · waiting for a tone`}
        </p>
      </div>

      <CentsNeedle cents={voiced ? pitch.cents : null} />

      <div className="space-y-1">
        <p className="text-xs font-medium text-muted">Pitch history (Hz)</p>
        <HzSpark values={hzHistory} />
      </div>

      <p className="text-center font-mono text-[11px] text-muted">
        buffer 2048 · hop 512 · {sampleRate} Hz · 70–900 Hz
      </p>
    </Panel>
  );
}
