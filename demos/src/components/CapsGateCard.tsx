import { ShieldCheck } from "lucide-react";

import { Panel } from "@/components/lab/Panel";
import { cn } from "@/lib/cn";
import {
  BOARDS,
  CAP,
  WORKSHOP_BOARD,
  WORKSHOP_BOARD_ID,
  boardHas,
  type WorkshopBoardId,
} from "@/lib/workshop";

const ROWS: Array<{ cap: number; name: string; labs: string }> = [
  { cap: CAP.LED, name: "LED", labs: "ex04–ex05, ex23–ex24" },
  { cap: CAP.MIC, name: "MIC", labs: "ex11–ex15, ex23" },
  { cap: CAP.IMU, name: "IMU", labs: "ex20–ex21" },
  { cap: CAP.RTC, name: "RTC", labs: "ex22 (persist)" },
  { cap: CAP.BATT, name: "BATT", labs: "ex18–ex19" },
  { cap: CAP.BTN, name: "BTN", labs: "ex16–ex17, ex24" },
];

/** ex25 — capability matrix for the active WORKSHOP_BOARD_ID. */
export function CapsGateCard() {
  const other: WorkshopBoardId = WORKSHOP_BOARD_ID === "es3c28p" ? "ws28p" : "es3c28p";

  return (
    <Panel className="border-serial/30">
      <div className="flex items-center gap-2 text-sm font-medium">
        <ShieldCheck className="size-4 text-serial" aria-hidden />
        Capability gate
      </div>

      <p className="text-sm text-muted">
        Active target:{" "}
        <span className="font-mono text-serial">{WORKSHOP_BOARD.id}</span> —{" "}
        {WORKSHOP_BOARD.blurb}. Switch in{" "}
        <span className="font-mono text-xs">src/lib/workshop.ts</span>, then flash
        matching prebuilt.
      </p>

      <table className="w-full text-left text-sm">
        <thead className="text-xs uppercase tracking-wide text-muted">
          <tr>
            <th className="py-1">Cap</th>
            <th className="py-1">{WORKSHOP_BOARD_ID}</th>
            <th className="py-1">{other}</th>
            <th className="py-1">Labs</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => {
            const here = boardHas(row.cap);
            const there = (BOARDS[other].caps & row.cap) !== 0;
            return (
              <tr key={row.name} className="border-t border-line/60">
                <td className="py-2 font-mono text-xs">{row.name}</td>
                <td className={cn("py-2", here ? "text-accent" : "text-muted")}>
                  {here ? "yes" : "—"}
                </td>
                <td className={cn("py-2", there ? "text-accent" : "text-muted")}>
                  {there ? "yes" : "—"}
                </td>
                <td className="py-2 text-xs text-muted">{row.labs}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Panel>
  );
}
