import { KeyEventCard } from "@/components/KeyEventCard";
import { SerialPortCard } from "@/components/SerialPortCard";
import { LabPage } from "@/components/lab/LabPage";
import { useAppliance } from "@/hooks/useAppliance";

import { Ex24Header } from "./Ex24Header";

/**
 * Ex24 — Button appliance.
 *
 * ── FOCUS: map SHORT / DOUBLE / LONG to LED + SFX.
 */
export function Ex24ButtonAppliance() {
  const app = useAppliance();

  return (
    <LabPage width="lg">
      <Ex24Header />
      <SerialPortCard
        {...app}
      />
      <KeyEventCard
        btnSupported={app.btnSupported}
        ready={app.ready}
        portOpen={app.status === "open"}
        last={app.last}
        events={app.events}
        keyMessage={app.appMessage}
        actionHint={
          app.actionHint ??
          (app.ledSupported ? `Color index ${app.colorIndex + 1}/4` : null)
        }
        onClear={app.clear}
      />
    </LabPage>
  );
}
