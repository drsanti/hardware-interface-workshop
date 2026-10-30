import { Clock } from "lucide-react";

import { Panel } from "@/components/lab/Panel";
import type { BoardInfoView } from "@/lib/wire/boardInfo";

type Props = {
  rtcSupported: boolean;
  ready: boolean;
  portOpen: boolean;
  info: BoardInfoView | null;
  rtcMessage: string | null;
  onSync: () => void;
};

function formatUnixNs(unixNs: number): string {
  if (!unixNs) return "—";
  const ms = unixNs / 1e6;
  if (!Number.isFinite(ms) || ms < 1e11) return "—";
  return new Date(ms).toISOString().replace("T", " ").replace("Z", " UTC");
}

/** TimeSync + BoardInfo clock — ex22. */
export function RtcCard({
  rtcSupported,
  ready,
  portOpen,
  info,
  rtcMessage,
  onSync,
}: Props) {
  return (
    <Panel className={rtcSupported ? "border-accent/30" : "border-serial/30"}>
      <div className="flex items-center gap-2 text-sm font-medium">
        <Clock className="size-4 text-accent" aria-hidden />
        Board clock
      </div>

      {!portOpen ? (
        <p className="text-sm text-muted">Connect first, then Sync now.</p>
      ) : !ready ? (
        <p className="text-sm text-muted">Waiting for the board to settle…</p>
      ) : (
        <>
          <div className="rounded-md border border-line px-4 py-5 text-center">
            <p className="font-mono text-lg text-white">
              {info ? formatUnixNs(info.unixNs) : "Waiting for BoardInfo…"}
            </p>
            <p className="mt-2 text-sm text-muted">
              synced:{" "}
              <span className={info?.synced ? "text-accent" : "text-warn"}>
                {info ? String(info.synced) : "—"}
              </span>
              {!rtcSupported ? (
                <span className="block text-[11px]">
                  Soft clock only — flash ws28p for hardware RTC persist.
                </span>
              ) : (
                <span className="block text-[11px]">Hardware RTC (CAP.RTC) present.</span>
              )}
            </p>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={onSync}
              className="rounded-md border border-accent/40 bg-accent/15 px-4 py-2 text-sm text-accent hover:bg-accent/25"
            >
              Sync now
            </button>
          </div>
        </>
      )}

      <p className="min-h-5 text-center text-sm text-muted">{rtcMessage}</p>
    </Panel>
  );
}
