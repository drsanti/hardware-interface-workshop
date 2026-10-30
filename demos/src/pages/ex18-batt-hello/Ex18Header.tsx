import { LabHeader } from "@/components/lab/LabHeader";

export function Ex18Header() {
  return (
    <LabHeader
      ex="ex18"
      focus="Battery"
      title="Read battery status"
      description="Board pushes BatteryStatus (0x25) about every 10 seconds — millivolts and percent. Works on both board targets."
    />
  );
}
