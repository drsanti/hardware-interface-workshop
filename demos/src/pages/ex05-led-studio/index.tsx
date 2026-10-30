import { LedStudioCard } from "@/components/LedStudioCard";
import { SerialPortCard } from "@/components/SerialPortCard";
import { LabPage } from "@/components/lab/LabPage";
import { useLedStudio } from "@/hooks/useLedStudio";

import { Ex05Header } from "./Ex05Header";

/**
 * ex05 — RGB sliders + LedFx motion presets over Web Serial.
 *
 * Studio combines solid RGB (sliders/presets) with motion FX ids.
 * Channel edits update local RGB; Apply / preset / FX send to the board.
 */
export function Ex05LedStudio() {
  const led = useLedStudio();

  return (
    <LabPage width="lg">
      <Ex05Header />
      <SerialPortCard
        {...led}
      />
      <LedStudioCard
        ledSupported={led.ledSupported}
        ready={led.ready}
        portOpen={led.status === "open"}
        rgb={led.rgb}
        commanded={led.commanded}
        echoed={led.echoed}
        mode={led.mode}
        ledMessage={led.ledMessage}
        // ── FOCUS: solid RGB vs LedFx motion ──────────────────────────
        onChannel={led.setChannel} // ← local slider state
        onSolidPreset={(rgb) => void led.applySolid(rgb)} // ← solid color
        onFx={(id) => void led.applyFx(id)} // ← LedFx preset
        onOff={() => void led.turnOff()}
      />
    </LabPage>
  );
}
