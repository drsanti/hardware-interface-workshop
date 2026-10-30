import { CapsGateCard } from "@/components/CapsGateCard";
import { LabPage } from "@/components/lab/LabPage";
import { WORKSHOP_BOARD } from "@/lib/workshop";

import { Ex25Header } from "./Ex25Header";

/**
 * Ex25 — Capability gate.
 *
 * ── FOCUS: boardHas / WORKSHOP_BOARD_ID — no serial required.
 */
export function Ex25CapsGate() {
  return (
    <LabPage width="lg">
      <Ex25Header />
      <p className="text-sm text-muted">
        Current workshop target:{" "}
        <span className="font-mono text-serial">{WORKSHOP_BOARD.id}</span>
      </p>
      <CapsGateCard />
    </LabPage>
  );
}
