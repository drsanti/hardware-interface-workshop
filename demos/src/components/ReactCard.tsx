import { Zap } from "lucide-react";

import { Panel } from "@/components/lab/Panel";
import { cn } from "@/lib/cn";

type Props = {
  reacting: boolean;
  ledSupported: boolean;
  sfxSupported: boolean;
  lastAction: string | null;
  onReacting: (on: boolean) => void;
};

/** Board reaction toggle + mapping legend (ex33). */
export function ReactCard({
  reacting,
  ledSupported,
  sfxSupported,
  lastAction,
  onReacting,
}: Props) {
  return (
    <Panel>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Zap className="size-4 text-serial" aria-hidden />
          Board reactions
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
        Stable class (~0.25 s) drives LED
        {sfxSupported ? " + SFX" : ""}. Needs{" "}
        <span className="font-mono text-xs text-serial">es3c28p</span>
        {!ledSupported ? " (no LED on this target)" : ""}.
      </p>

      <ul className="space-y-1 font-mono text-xs text-muted">
        <li>silence → LED off</li>
        <li>speech → blue LED</li>
        <li>whistle → green LED{sfxSupported ? " + Chime" : ""}</li>
        <li>noise → amber LED{sfxSupported ? " + rare Beep" : ""}</li>
      </ul>

      <p className="min-h-5 text-center text-sm text-muted">
        {lastAction ?? "Waiting for a stable class…"}
      </p>
    </Panel>
  );
}
