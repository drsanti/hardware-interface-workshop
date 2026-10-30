import { SerialPortCard } from "@/components/SerialPortCard";
import { LabPage } from "@/components/lab/LabPage";
import { useSerialSession } from "@/hooks/useSerialSession";

import { Ex02Header } from "./Ex02Header";

/**
 * ex02 — Board link picker: USB Serial and/or Web Bluetooth.
 *
 * First connect lab. Same COBS pipe later labs use — here we only
 * open and close the link (no app messages yet).
 */
export function Ex02WebSerialPicker() {
  // ── FOCUS: open/close USB or BLE; no app protocol yet ─────────────
  const link = useSerialSession();

  return (
    <LabPage width="lg">
      <Ex02Header />
      <SerialPortCard {...link} />
    </LabPage>
  );
}
