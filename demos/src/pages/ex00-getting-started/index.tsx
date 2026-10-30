import { BoardSummary } from "@/components/BoardSummary";
import { BrowserCapabilities } from "@/components/BrowserCapabilities";
import { TransportCards } from "@/components/TransportCards";
import { LabPage } from "@/components/lab/LabPage";

import { Ex00Header } from "./Ex00Header";
import { Ex00SwitchHint } from "./Ex00SwitchHint";

/**
 * ex00 — workshop overview + browser capability check.
 *
 * No serial yet. Confirm Chrome/Edge + Web Serial, then switch labs in App.tsx.
 */
export function Ex00GettingStarted() {
  return (
    <LabPage>
      <Ex00Header />
      {/* FOCUS: which board / firmware this workshop expects */}
      <BoardSummary />
      {/* FOCUS: Web Serial must show supported before later labs work */}
      <BrowserCapabilities />
      <TransportCards />
      {/* FOCUS: how to flip the active lab in src/App.tsx */}
      <Ex00SwitchHint />
    </LabPage>
  );
}
