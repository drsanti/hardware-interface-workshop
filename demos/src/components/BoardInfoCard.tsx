import { CircuitBoard } from "lucide-react";

import { InlineCode } from "@/components/lab/InlineCode";
import { Panel } from "@/components/lab/Panel";
import type { BoardInfoView } from "@/lib/wire";

type Props = {
  info: BoardInfoView | null;
  listenMessage: string | null;
  decoderOk: boolean;
  portOpen: boolean;
};

/** Shows the board identity message once it arrives. */
export function BoardInfoCard({ info, listenMessage, decoderOk, portOpen }: Props) {
  return (
    <Panel className="border-accent/30">
      <div className="flex items-center gap-2 text-sm font-medium">
        <CircuitBoard className="size-4 text-accent" aria-hidden />
        Board hello
      </div>

      {!portOpen ? (
        <p className="text-sm text-muted">
          Connect first — the board sends its identity after USB opens.
        </p>
      ) : !info ? (
        <p className="text-sm text-muted">{listenMessage ?? "Listening…"}</p>
      ) : (
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted">Model</dt>
            <dd className="font-medium text-white">{info.hwModel || "—"}</dd>
          </div>
          <div>
            <dt className="text-muted">Firmware</dt>
            <dd className="font-medium text-white">{info.fwVersion || "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-muted">Features</dt>
            <dd className="font-medium text-white">
              {info.features.length > 0 ? info.features.join(" · ") : "none reported"}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-muted">Id</dt>
            <dd>
              <InlineCode className="text-xs break-all">{info.uuid || "—"}</InlineCode>
            </dd>
          </div>
          {info.mac ? (
            <div className="sm:col-span-2">
              <dt className="text-muted">MAC</dt>
              <dd>
                <InlineCode className="text-xs">{info.mac}</InlineCode>
              </dd>
            </div>
          ) : null}
        </dl>
      )}

      <p className="text-xs text-muted">Local decoder check: {decoderOk ? "ok" : "failed"}</p>
    </Panel>
  );
}
