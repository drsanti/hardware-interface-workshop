import { Keyboard } from "lucide-react";

import { Panel } from "@/components/lab/Panel";
import { cn } from "@/lib/cn";
import { keyEvLabel, keyLabel, type KeyEventView } from "@/lib/wire/key";

type Props = {
  btnSupported: boolean;
  ready: boolean;
  portOpen: boolean;
  last: KeyEventView | null;
  events: KeyEventView[];
  keyMessage: string | null;
  /** When set, show action hint under the last event. */
  actionHint?: string | null;
  onClear?: () => void;
};

/** Live KeyEvent log — used by ex16 / ex17 / ex24. */
export function KeyEventCard({
  btnSupported,
  ready,
  portOpen,
  last,
  events,
  keyMessage,
  actionHint,
  onClear,
}: Props) {
  return (
    <Panel className={btnSupported ? "border-serial/30" : "border-warn/30"}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Keyboard className="size-4 text-serial" aria-hidden />
          Button events
        </div>
        {onClear ? (
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-muted hover:text-white"
          >
            Clear
          </button>
        ) : null}
      </div>

      {!btnSupported ? (
        <p className="text-sm text-muted">No CAP.BTN on this workshop target.</p>
      ) : !portOpen ? (
        <p className="text-sm text-muted">Connect first, then press a board button.</p>
      ) : !ready ? (
        <p className="text-sm text-muted">Waiting for the board to settle…</p>
      ) : (
        <>
          <div
            className={cn(
              "rounded-md border px-4 py-6 text-center",
              last ? "border-serial/40 bg-serial/10" : "border-line",
            )}
          >
            {last ? (
              <>
                <p className="text-2xl font-semibold text-white">
                  {keyLabel(last.key)} · {keyEvLabel(last.event)}
                </p>
                <p className="mt-1 font-mono text-xs text-muted">
                  hold {last.holdMs} ms · t={last.timestampMs}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted">Waiting for a press…</p>
            )}
          </div>

          {actionHint ? <p className="text-center text-sm text-accent">{actionHint}</p> : null}

          <ul className="max-h-40 space-y-1 overflow-y-auto font-mono text-xs text-muted">
            {events.map((e, i) => (
              <li key={`${e.timestampMs}-${i}`}>
                {keyLabel(e.key)} {keyEvLabel(e.event)}
                {e.holdMs ? ` (${e.holdMs} ms)` : ""}
              </li>
            ))}
          </ul>
        </>
      )}

      <p className="min-h-5 text-center text-sm text-muted">{keyMessage}</p>
    </Panel>
  );
}
