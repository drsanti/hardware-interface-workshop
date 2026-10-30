import { LedControlCard } from "@/components/LedControlCard";
import { SerialPortCard } from "@/components/SerialPortCard";
import { LabPage } from "@/components/lab/LabPage";
import { useLedControl } from "@/hooks/useLedControl";

import { Ex04Header } from "./Ex04Header";

/**
 * ex04 — send RGB LED color commands over Web Serial.
 *
 * First outbound app message after Hello. Controls stay gated on
 * `ready` + LED capability from the board identity.
 */
export function Ex04RgbLed() {
  const led = useLedControl();

  return (
    <LabPage width="lg">
      <Ex04Header />
      <SerialPortCard
        {...led}
      />
      <LedControlCard
        ledSupported={led.ledSupported}
        ready={led.ready}
        portOpen={led.status === "open"}
        commanded={led.commanded}
        echoed={led.echoed}
        ledMessage={led.ledMessage}
        // ── FOCUS: color buttons → LedCmd; Off blanks the LED ─────────
        onSetColor={(rgb) => void led.setColor(rgb)} // ← solid RGB
        onOff={() => void led.turnOff()}
      />
    </LabPage>
  );
}
