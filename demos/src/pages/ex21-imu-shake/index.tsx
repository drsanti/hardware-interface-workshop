import { ImuCard } from "@/components/ImuCard";
import { SerialPortCard } from "@/components/SerialPortCard";
import { LabPage } from "@/components/lab/LabPage";
import { useShakeSfx } from "@/hooks/useShakeSfx";

import { Ex21Header } from "./Ex21Header";

/**
 * Ex21 — IMU shake → SFX.
 *
 * ── FOCUS: magnitude threshold edge → SfxCmd (ws28p).
 */
export function Ex21ImuShake() {
  const imu = useShakeSfx();

  return (
    <LabPage width="lg">
      <Ex21Header />
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
        shakeCount={imu.shakeCount}
        shakeThreshold={imu.shakeThreshold}
        onShakeThreshold={imu.setShakeThreshold}
        onResetShake={imu.resetShake}
      />
    </LabPage>
  );
}
