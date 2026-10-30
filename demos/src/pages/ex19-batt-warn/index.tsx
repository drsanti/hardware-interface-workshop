import { BatteryCard } from "@/components/BatteryCard";
import { SerialPortCard } from "@/components/SerialPortCard";
import { LabPage } from "@/components/lab/LabPage";
import { useBattery } from "@/hooks/useBattery";

import { Ex19Header } from "./Ex19Header";

const WARN_BELOW = 25;

/**
 * Ex19 — Battery warn.
 *
 * ── FOCUS: host-side threshold on the same 0x25 stream.
 */
export function Ex19BattWarn() {
  const batt = useBattery();

  return (
    <LabPage width="lg">
      <Ex19Header />
      <SerialPortCard
        {...batt}
      />
      <BatteryCard
        battSupported={batt.battSupported}
        ready={batt.ready}
        portOpen={batt.status === "open"}
        battery={batt.battery}
        updatedAt={batt.updatedAt}
        battMessage={batt.battMessage}
        warnBelow={WARN_BELOW}
      />
    </LabPage>
  );
}
