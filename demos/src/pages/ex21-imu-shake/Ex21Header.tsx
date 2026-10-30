import { LabHeader } from "@/components/lab/LabHeader";

export function Ex21Header() {
  return (
    <LabHeader
      ex="ex21"
      focus="IMU shake"
      title="Shake → beep"
      description="When |accel| crosses a threshold, send SfxCmd Beep. Tune the threshold so a deliberate shake fires once."
    />
  );
}
