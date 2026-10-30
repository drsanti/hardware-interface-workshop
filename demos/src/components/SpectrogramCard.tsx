import { ChartArea } from "lucide-react";
import { useEffect, useRef } from "react";

import { Panel } from "@/components/lab/Panel";

const COLS = 320;

type Props = {
  column: Uint8Array | null;
  columnSeq: number;
  binCount: number;
  sampleRate: number;
  streaming: boolean;
  fftReady: boolean;
  micSupported: boolean;
};

/** Map 0..255 magnitude → RGB (dark → blue → cyan → yellow → white). */
function heat(v: number): [number, number, number] {
  const t = Math.max(0, Math.min(1, v / 255));
  if (t < 0.25) {
    const u = t / 0.25;
    return [0, 0, Math.round(40 + u * 180)];
  }
  if (t < 0.5) {
    const u = (t - 0.25) / 0.25;
    return [0, Math.round(u * 200), 220];
  }
  if (t < 0.75) {
    const u = (t - 0.5) / 0.25;
    return [Math.round(u * 240), 220, Math.round(220 * (1 - u))];
  }
  const u = (t - 0.75) / 0.25;
  return [240, Math.round(220 + u * 35), Math.round(u * 255)];
}

/**
 * Scrolling time×frequency spectrogram (ex27).
 * X = time (right = newest), Y = frequency (bottom = 0 Hz).
 */
export function SpectrogramCard({
  column,
  columnSeq,
  binCount,
  sampleRate,
  streaming,
  fftReady,
  micSupported,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rows = Math.max(1, binCount);
  const nyquist = sampleRate / 2;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = COLS;
    canvas.height = rows;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#0f1419";
    ctx.fillRect(0, 0, COLS, rows);
  }, [rows]);

  useEffect(() => {
    if (!column || column.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    /* Scroll left one pixel, paint newest column on the right. */
    ctx.drawImage(canvas, -1, 0);
    const img = ctx.createImageData(1, rows);
    const n = Math.min(rows, column.length);
    for (let y = 0; y < rows; y++) {
      /* Low frequency at bottom. */
      const bin = n - 1 - y;
      const [r, g, b] = heat(column[bin] ?? 0);
      const i = y * 4;
      img.data[i] = r;
      img.data[i + 1] = g;
      img.data[i + 2] = b;
      img.data[i + 3] = 255;
    }
    ctx.putImageData(img, COLS - 1, 0);
  }, [column, columnSeq, rows]);

  const hint = !micSupported
    ? "No mic on this board target — switch to es3c28p."
    : !streaming
      ? "Turn on Stream PCM — each hop paints one time column."
      : !fftReady
        ? "Starting spectrogram…"
        : "Speak — bright bands show energy over time.";

  return (
    <Panel>
      <div className="flex items-center gap-2 text-sm font-medium">
        <ChartArea className="size-4 text-serial" aria-hidden />
        Spectrogram
      </div>
      <p className="text-sm text-muted">{hint}</p>

      <canvas
        ref={canvasRef}
        className="h-48 w-full rounded-md border border-line bg-ink"
        style={{ imageRendering: "pixelated" }}
      />

      <div className="flex justify-between font-mono text-[11px] text-muted">
        <span>older ←</span>
        <span>0 … {nyquist.toFixed(0)} Hz ↑</span>
        <span>→ newer</span>
      </div>
      <p className="text-center font-mono text-[11px] text-muted">
        {COLS} cols · {rows} bins · {sampleRate} Hz
      </p>
    </Panel>
  );
}
