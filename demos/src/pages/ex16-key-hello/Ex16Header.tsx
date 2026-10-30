import { LabHeader } from "@/components/lab/LabHeader";

export function Ex16Header() {
  return (
    <LabHeader
      ex="ex16"
      focus="Key events"
      title="Listen for button presses"
      description="Board → host KeyEvent (0x2c). No enable command — press BOOT (or PWR on ws28p) and watch SHORT / LONG / DOUBLE."
    />
  );
}
