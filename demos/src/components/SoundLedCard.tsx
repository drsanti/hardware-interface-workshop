import { Mic, Sparkles } from "lucide-react";

import { Panel } from "@/components/lab/Panel";
import { cn } from "@/lib/cn";
import { levelToPercent, type AudioLevelView } from "@/lib/wire/mic";
import type { Rgb } from "@/lib/wire/led";

type Props = {
  micSupported: boolean;
  ledSupported: boolean;
  ready: boolean;
  portOpen: boolean;
  enabled: boolean;
  level: AudioLevelView | null;
  ledRgb: Rgb;
  soundMessage: string | null;
  onEnable: (on: boolean) => void;
};

/** ex23 — mic level drives LED color. */
export function SoundLedCard({
  micSupported,
  ledSupported,
  ready,
  portOpen,
  enabled,
  level,
  ledRgb,
  soundMessage,
  onEnable,
}: Props) {
  const ok = micSupported && ledSupported;
  const pct = levelToPercent(level?.peak ?? level?.rms ?? 0);

  return (
    <Panel className={ok ? "border-accent/30" : "border-warn/30"}>
      <div className="flex items-center gap-2 text-sm font-medium">
        <Sparkles className="size-4 text-accent" aria-hidden />
        Sound → LED
      </div>

      {!ok ? (
        <p className="text-sm text-muted">Needs es3c28p (MIC + LED caps).</p>
      ) : !portOpen ? (
        <p className="text-sm text-muted">Connect first, then enable the mic.</p>
      ) : !ready ? (
        <p className="text-sm text-muted">Waiting for the board to settle…</p>
      ) : (
        <>
          <div className="flex justify-center">
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
              <Mic className="size-4" aria-hidden />
              {enabled ? "Mic on" : "Mic off"}
            </button>
          </div>

          <div className="flex flex-col items-center gap-3 py-2">
            <div
              className="size-20 rounded-full border border-line shadow-inner"
              style={{
                backgroundColor: `rgb(${ledRgb.r} ${ledRgb.g} ${ledRgb.b})`,
              }}
            />
            <div className="h-3 w-full max-w-xs overflow-hidden rounded-md border border-line bg-ink">
              <div className="h-full bg-accent transition-[width]" style={{ width: `${pct}%` }} />
            </div>
            <p className="font-mono text-xs text-muted">
              level {pct.toFixed(0)}% · LED rgb({ledRgb.r},{ledRgb.g},{ledRgb.b})
            </p>
          </div>
        </>
      )}

      <p className="min-h-5 text-center text-sm text-muted">{soundMessage}</p>
    </Panel>
  );
}
