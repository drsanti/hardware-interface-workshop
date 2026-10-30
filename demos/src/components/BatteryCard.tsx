import { Battery, BatteryLow, BatteryWarning } from "lucide-react";

import { Panel } from "@/components/lab/Panel";
import { cn } from "@/lib/cn";
import type { BatteryStatusView } from "@/lib/wire/battery";

type Props = {
  battSupported: boolean;
  ready: boolean;
  portOpen: boolean;
  battery: BatteryStatusView | null;
  updatedAt: number | null;
  battMessage: string | null;
  /** When set, highlight if pct is at/below this level. */
  warnBelow?: number;
};

/** BatteryStatus readout — ex18 hello / ex19 warn. */
export function BatteryCard({
  battSupported,
  ready,
  portOpen,
  battery,
  updatedAt,
  battMessage,
  warnBelow,
}: Props) {
  const pct = battery?.pct ?? 0;
  const warn = warnBelow != null && battery != null && pct <= warnBelow;
  const Icon = !battery ? Battery : warn ? BatteryWarning : pct < 30 ? BatteryLow : Battery;

  return (
    <Panel className={battSupported ? (warn ? "border-warn/40" : "border-accent/30") : "border-warn/30"}>
      <div className="flex items-center gap-2 text-sm font-medium">
        <Icon className={cn("size-4", warn ? "text-warn" : "text-accent")} aria-hidden />
        Battery
      </div>

      {!battSupported ? (
        <p className="text-sm text-muted">No CAP.BATT on this workshop target.</p>
      ) : !portOpen ? (
        <p className="text-sm text-muted">Connect first — status arrives ~every 10 s.</p>
      ) : !ready ? (
        <p className="text-sm text-muted">Waiting for the board to settle…</p>
      ) : !battery ? (
        <p className="text-sm text-muted">Waiting for first BatteryStatus…</p>
      ) : (
        <>
          <div className="space-y-2">
            <div className="h-5 overflow-hidden rounded-md border border-line bg-ink">
              <div
                className={cn("h-full transition-[width]", warn ? "bg-warn" : "bg-accent")}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-center text-3xl font-semibold tabular-nums text-white">
              {pct}
              <span className="text-lg text-muted">%</span>
            </p>
            <p className="text-center font-mono text-sm text-muted">{battery.mv} mV</p>
            {warnBelow != null ? (
              <p className={cn("text-center text-sm", warn ? "text-warn" : "text-muted")}>
                {warn
                  ? `Low — at or below warn threshold (${warnBelow}%).`
                  : `Warn threshold ${warnBelow}% — OK for now.`}
              </p>
            ) : null}
            {updatedAt ? (
              <p className="text-center text-[11px] text-muted">
                Updated {new Date(updatedAt).toLocaleTimeString()}
              </p>
            ) : null}
          </div>
        </>
      )}

      <p className="min-h-5 text-center text-sm text-muted">{battMessage}</p>
    </Panel>
  );
}
