import { KeyEventCard } from "@/components/KeyEventCard";
import { SerialPortCard } from "@/components/SerialPortCard";
import { LabPage } from "@/components/lab/LabPage";
import { useKeyAction } from "@/hooks/useKeyAction";

import { Ex17Header } from "./Ex17Header";

/**
 * Ex17 — Key action.
 *
 * ── FOCUS: SHORT KeyEvent → SfxCmd (+ optional LedFx).
 */
export function Ex17KeyAction() {
  const key = useKeyAction();

  return (
    <LabPage width="lg">
      <Ex17Header />
      <SerialPortCard
        {...key}
      />
      <KeyEventCard
        btnSupported={key.btnSupported}
        ready={key.ready}
        portOpen={key.status === "open"}
        last={key.last}
        events={key.events}
        keyMessage={key.keyMessage}
        actionHint={key.actionHint}
        onClear={key.clear}
      />
    </LabPage>
  );
}
