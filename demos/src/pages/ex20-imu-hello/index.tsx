import { ImuCard } from "@/components/ImuCard";
import { SerialPortCard } from "@/components/SerialPortCard";
import { LabPage } from "@/components/lab/LabPage";
import { useImu } from "@/hooks/useImu";

import { Ex20Header } from "./Ex20Header";

/**
 * Ex20 — IMU hello.
 *
 * ── FOCUS: decode Imu (0x20) accel bars. Flash ws28p.
 */
export function Ex20ImuHello() {
  const imu = useImu();

  return (
    <LabPage width="lg">
      <Ex20Header />
      <SerialPortCard
        {...imu}
      />
      <ImuCard
        imuSupported={imu.imuSupported}
        ready={imu.ready}
        portOpen={imu.status === "open"}
        sample={imu.sample}
        magnitude={imu.magnitude}
        imuMessage={imu.imuMessage}
      />
    </LabPage>
  );
}
