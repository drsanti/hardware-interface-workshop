import { KeyEventCard } from "@/components/KeyEventCard";
import { SerialPortCard } from "@/components/SerialPortCard";
import { LabPage } from "@/components/lab/LabPage";
import { useKey } from "@/hooks/useKey";

import { Ex16Header } from "./Ex16Header";

/**
 * Ex16 — Key hello.
 *
 * ── FOCUS: subscribe to KeyEvent only (no host command).
 */
export function Ex16KeyHello() {
  const key = useKey();

  return (
    <LabPage width="lg">
      <Ex16Header />
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
        onClear={key.clear}
      />
    </LabPage>
  );
}
