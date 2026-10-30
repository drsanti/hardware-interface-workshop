import { LabHeader } from "@/components/lab/LabHeader";

export function Ex20Header() {
  return (
    <LabHeader
      ex="ex20"
      focus="IMU"
      title="Watch motion samples"
      description="ws28p streams robotos.sensor.v1.Imu on 0x20 (~50 Hz). Tilt the board and watch accel axes. Needs CAP.IMU."
    />
  );
}
