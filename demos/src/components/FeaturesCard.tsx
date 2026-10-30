import { Gauge } from "lucide-react";

import { Panel } from "@/components/lab/Panel";
import type { AudioFeatures } from "@/lib/pcm/features";

type Props = {
  features: AudioFeatures;
  centroidHistory: Float32Array;
  rmsHistory: Float32Array;
  sampleRate: number;
  streaming: boolean;
  featuresReady: boolean;
  micSupported: boolean;
};

function Spark({
  values,
  max,
  stroke,
}: {
  values: Float32Array;
  max: number;
  stroke: string;
}) {
  const w = 320;
  const h = 56;
  const m = Math.max(max, 1e-6);
  let d = "";
  for (let i = 0; i < values.length; i++) {
    const x = (i / Math.max(1, values.length - 1)) * w;
    const y = h - ((values[i] ?? 0) / m) * (h - 4) - 2;
    d += `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)} `;
  }
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-14 w-full rounded-md border border-line bg-ink"
      preserveAspectRatio="none"
    >
      <path d={d} fill="none" stroke={stroke} strokeWidth="1.75" />
    </svg>
  );
}

function Meter({
  label,
  value,
  display,
  pct,
}: {
  label: string;
  value: string;
  display: string;
  pct: number;
}) {
  const w = Math.max(0, Math.min(100, pct));
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="font-medium text-muted">{label}</span>
        <span className="font-mono text-muted" title={display}>
          {value}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-sm border border-line bg-ink">
        <div className="h-full bg-serial/80 transition-[width] duration-75" style={{ width: `${w}%` }} />
      </div>
    </div>
  );
}

/** Live MIR feature meters + sparklines (ex30). */
export function FeaturesCard({
  features,
  centroidHistory,
  rmsHistory,
  sampleRate,
  streaming,
  featuresReady,
  micSupported,
}: Props) {
  const nyquist = sampleRate / 2;
  const hint = !micSupported
    ? "No mic on this board target — switch to es3c28p."
    : !streaming
      ? "Turn on Stream PCM — features update every FFT hop."
      : !featuresReady
        ? "Starting feature tap…"
        : "Whistle → high centroid · noisy room → higher flatness.";

  return (
    <Panel>
      <div className="flex items-center gap-2 text-sm font-medium">
        <Gauge className="size-4 text-serial" aria-hidden />
        Feature extraction
      </div>
      <p className="text-sm text-muted">{hint}</p>

      <div className="grid gap-3 sm:grid-cols-2">
        <Meter
          label="RMS"
          value={features.rms.toFixed(3)}
          display="time-domain level"
          pct={features.rms * 100 * 2.5}
        />
        <Meter
          label="ZCR"
          value={features.zcr.toFixed(3)}
          display="zero-crossing rate"
          pct={features.zcr * 100 * 4}
        />
        <Meter
          label="Centroid"
          value={`${features.centroidHz.toFixed(0)} Hz`}
          display="spectral center of mass"
          pct={(features.centroidHz / nyquist) * 100}
        />
        <Meter
          label="Flatness"
          value={features.flatness.toFixed(3)}
          display="0 tonal · 1 noise-like"
          pct={features.flatness * 100}
        />
        <Meter
          label="Rolloff 85%"
          value={`${features.rolloffHz.toFixed(0)} Hz`}
          display="frequency holding 85% of energy"
          pct={(features.rolloffHz / nyquist) * 100}
        />
      </div>

      <div className="space-y-1">
        <p className="text-xs font-medium text-muted">Centroid history</p>
        <Spark values={centroidHistory} max={nyquist * 0.6} stroke="#58a6ff" />
      </div>
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted">RMS history</p>
        <Spark values={rmsHistory} max={0.4} stroke="#3fb950" />
      </div>

      <p className="text-center font-mono text-[11px] text-muted">
        frame 512 · hop 256 · {sampleRate} Hz
      </p>
    </Panel>
  );
}
