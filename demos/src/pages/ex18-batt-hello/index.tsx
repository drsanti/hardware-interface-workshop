import { BatteryCard } from "@/components/BatteryCard";
import { SerialPortCard } from "@/components/SerialPortCard";
import { LabPage } from "@/components/lab/LabPage";
import { useBattery } from "@/hooks/useBattery";

import { Ex18Header } from "./Ex18Header";

/**
 * Ex18 — Battery hello.
 *
 * ── FOCUS: listen for BatteryStatus (no host poll command).
 */
export function Ex18BattHello() {
  const batt = useBattery();

  return (
    <LabPage width="lg">
      <Ex18Header />
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
      />
    </LabPage>
  );
}
