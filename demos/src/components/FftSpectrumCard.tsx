import { AudioWaveform } from "lucide-react";
import { useMemo } from "react";

import { Panel } from "@/components/lab/Panel";

type Props = {
  spectrum: Uint8Array;
  peakHz: number;
  sampleRate: number;
  streaming: boolean;
  fftReady: boolean;
  micSupported: boolean;
};

/** Live FFT bar strip from MicPcm → AnalyserNode (ex26). */
export function FftSpectrumCard({
  spectrum,
  peakHz,
  sampleRate,
  streaming,
  fftReady,
  micSupported,
}: Props) {
  const w = 640;
  const h = 180;
  const n = spectrum.length;
  const nyquist = sampleRate / 2;
  const barW = n > 0 ? w / n : 0;

  const bars = useMemo(() => {
    const out: { x: number; y: number; width: number; height: number; key: number }[] = [];
    for (let i = 0; i < n; i++) {
      const v = (spectrum[i] ?? 0) / 255;
      const bh = Math.max(1, v * (h - 8));
      out.push({
        key: i,
        x: i * barW,
        y: h - bh,
        width: Math.max(0.5, barW - 0.4),
        height: bh,
      });
    }
    return out;
  }, [barW, h, n, spectrum]);

  const hint = !micSupported
    ? "No mic on this board target — switch to es3c28p."
    : !streaming
      ? "Turn on Stream PCM — audio feeds the FFT."
      : !fftReady
        ? "Starting FFT…"
        : peakHz > 0
          ? `Peak bin ≈ ${peakHz.toFixed(0)} Hz · Nyquist ${nyquist.toFixed(0)} Hz`
          : "Listening — speak to light the bars.";

  return (
    <Panel>
      <div className="flex items-center gap-2 text-sm font-medium">
        <AudioWaveform className="size-4 text-serial" aria-hidden />
        FFT spectrum
      </div>
      <p className="text-sm text-muted">{hint}</p>

      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-44 w-full rounded-md border border-line bg-ink"
        preserveAspectRatio="none"
      >
        {bars.map((b) => (
          <rect
            key={b.key}
            x={b.x}
            y={b.y}
            width={b.width}
            height={b.height}
            fill="#58a6ff"
          />
        ))}
      </svg>

      <div className="flex justify-between font-mono text-[11px] text-muted">
        <span>0 Hz</span>
        <span>{(nyquist / 2).toFixed(0)} Hz</span>
        <span>{nyquist.toFixed(0)} Hz</span>
      </div>
      <p className="text-center font-mono text-[11px] text-muted">
        fftSize {n * 2} · {sampleRate} Hz · in-process FFT
      </p>
    </Panel>
  );
}
