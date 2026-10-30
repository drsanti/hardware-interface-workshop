import { LabHeader } from "@/components/lab/LabHeader";

export function Ex19Header() {
  return (
    <LabHeader
      ex="ex19"
      focus="Battery warn"
      title="Low-battery warning UI"
      description="Same BatteryStatus stream as ex18 — highlight when percent falls at or below a warn threshold (default 25%)."
    />
  );
}
