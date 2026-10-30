import { CircuitBoard } from "lucide-react";

import { Panel } from "@/components/lab/Panel";
import { cn } from "@/lib/cn";

type Props = {
  reacting: boolean;
  ledSupported: boolean;
  sfxSupported: boolean;
  btnSupported: boolean;
  battLow: boolean;
  battWarnBelow: number;
  lastAction: string | null;
  onReacting: (on: boolean) => void;
};

/** Mode + mapping legend for the multi-sensor appliance (ex34). */
export function SenseApplianceCard({
  reacting,
  ledSupported,
  sfxSupported,
  btnSupported,
  battLow,
  battWarnBelow,
  lastAction,
  onReacting,
}: Props) {
  return (
    <Panel className={battLow ? "border-warn/40" : undefined}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <CircuitBoard className="size-4 text-serial" aria-hidden />
          Sense appliance
        </div>
        <button
          type="button"
          onClick={() => onReacting(!reacting)}
          className={cn(
            "rounded-md border px-3 py-1.5 text-sm",
            reacting
              ? "border-accent/50 bg-accent/15 text-accent"
              : "border-line text-muted hover:border-muted hover:text-white",
          )}
        >
          {reacting ? "React on" : "React off"}
        </button>
      </div>

      <p className="text-sm text-muted">
        One USB session: classify → actuators, buttons override, battery gates SFX.
        Needs <span className="font-mono text-xs text-serial">es3c28p</span>
        {!ledSupported ? " (no LED on this target)" : ""}.
      </p>

      {battLow ? (
        <p className="rounded-md border border-warn/40 bg-warn/10 px-3 py-2 text-sm text-warn">
          Battery ≤ {battWarnBelow}% — SFX muted until charge recovers.
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <ul className="space-y-1 font-mono text-xs text-muted">
          <li className="font-sans text-xs font-medium text-white">Class → board</li>
          <li>silence → LED off</li>
          <li>speech → blue LED</li>
          <li>
            whistle → green
            {sfxSupported ? " + Chime" : ""}
          </li>
          <li>
            noise → amber
            {sfxSupported ? " + rare Beep" : ""}
          </li>
        </ul>
        <ul className="space-y-1 font-mono text-xs text-muted">
          <li className="font-sans text-xs font-medium text-white">BOOT button</li>
          {btnSupported ? (
            <>
              <li>SHORT → toggle React</li>
              <li>DOUBLE → Chime</li>
              <li>LONG → Stop + React off</li>
            </>
          ) : (
            <li>No CAP.BTN on this target</li>
          )}
        </ul>
      </div>

      <p className="min-h-5 text-center text-sm text-muted">
        {lastAction ?? "Waiting for a stable class…"}
      </p>
    </Panel>
  );
}
