import type { LucideIcon } from "lucide-react";
import { Battery, CircuitBoard, Compass, Mic, Sparkles, Watch } from "lucide-react";

import { InlineCode } from "@/components/lab/InlineCode";
import { Panel } from "@/components/lab/Panel";
import { BOARDS, type BoardFeatureId, WORKSHOP_BOARD } from "@/lib/workshop";

const FEATURE_ICONS: Record<BoardFeatureId, LucideIcon> = {
  led: Sparkles,
  mic: Mic,
  imu: Compass,
  rtc: Watch,
  batt: Battery,
  audio: CircuitBoard,
};

/** Target-board feature strip — follows `WORKSHOP_BOARD_ID` in `lib/workshop.ts`. */
export function BoardSummary() {
  const other = WORKSHOP_BOARD.id === "es3c28p" ? BOARDS.ws28p : BOARDS.es3c28p;

  return (
    <Panel className="border-accent/30">
      <div className="flex items-center gap-2 text-sm font-medium">
        <CircuitBoard className="size-4 text-accent" aria-hidden />
        Board · {WORKSHOP_BOARD.id}
      </div>
      <ul className="grid gap-3 sm:grid-cols-3">
        {WORKSHOP_BOARD.features.map(({ id, label, detail }) => {
          const Icon = FEATURE_ICONS[id];
          return (
            <li key={id} className="rounded-lg border border-line px-3 py-2">
              <Icon className="mb-1.5 size-4 text-accent" aria-hidden />
              <div className="text-sm font-medium">{label}</div>
              <div className="text-xs text-muted">{detail}</div>
            </li>
          );
        })}
      </ul>
      <p className="text-sm text-muted">
        Flash <InlineCode className="text-xs">{WORKSHOP_BOARD.prebuiltDir}</InlineCode>. Switch
        target in <InlineCode className="text-xs">src/lib/workshop.ts</InlineCode> (also supports{" "}
        <InlineCode className="text-xs">{other.id}</InlineCode> — {other.blurb}).
      </p>
    </Panel>
  );
}
