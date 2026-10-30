import { useCallback, useEffect, useRef, useState } from "react";

import { useAckedWrite } from "@/hooks/useAckedWrite";
import { useSerialSession, type SerialSessionState } from "@/hooks/useSerialSession";
import {
  MSG_IMU,
  accelMagnitude,
  decodeImu,
  type ImuView,
} from "@/lib/wire/imu";
import { encodeSfxPlay, MSG_SFX_CMD, SFX_PRESET } from "@/lib/wire/sfx";
import { CAP, boardHas } from "@/lib/workshop";

export type ShakeSfxState = Pick<
  SerialSessionState,
  | "status"
  | "message"
  | "supported"
  | "serialSupported"
  | "bleSupported"
  | "transport"
  | "port"
  | "ready"
  | "connect"
  | "connectSerial"
  | "connectBle"
  | "disconnect"
> & {
  imuSupported: boolean;
  sample: ImuView | null;
  magnitude: number;
  shakeCount: number;
  shakeThreshold: number;
  setShakeThreshold: (n: number) => void;
  resetShake: () => void;
  imuMessage: string | null;
};

/** ex21 — shake peak → Beep (one serial session). */
export function useShakeSfx(): ShakeSfxState {
  const session = useSerialSession();
  const {
    ready,
    subscribe,
    writeFrame,
    connect: connectPort,
    connectSerial: connectSerialPort,
    connectBle: connectBlePort,
    disconnect: disconnectPort,
  } = session;
  const { writeAcked, clearPending } = useAckedWrite(ready, subscribe, writeFrame);

  const imuSupported = boardHas(CAP.IMU);
  const [sample, setSample] = useState<ImuView | null>(null);
  const [magnitude, setMagnitude] = useState(0);
  const [shakeCount, setShakeCount] = useState(0);
  const [shakeThreshold, setShakeThreshold] = useState(18);
  const belowRef = useRef(true);
  const threshRef = useRef(shakeThreshold);
  const busyRef = useRef(false);
  threshRef.current = shakeThreshold;

  const resetUi = useCallback(() => {
    setSample(null);
    setMagnitude(0);
    setShakeCount(0);
    belowRef.current = true;
  }, []);

  const connect = useCallback(async () => {
    resetUi();
    await connectPort();
  }, [connectPort, resetUi]);

  const connectSerial = useCallback(async () => {
    resetUi();
    await connectSerialPort();
  }, [connectSerialPort, resetUi]);

  const connectBle = useCallback(async () => {
    resetUi();
    await connectBlePort();
  }, [connectBlePort, resetUi]);

  const disconnect = useCallback(async () => {
    clearPending();
    setSample(null);
    setMagnitude(0);
    await disconnectPort();
  }, [clearPending, disconnectPort]);

  const resetShake = useCallback(() => {
    setShakeCount(0);
    belowRef.current = true;
  }, []);

  useEffect(() => {
    if (!ready) return;
    return subscribe((frame) => {
      if (frame.msgType !== MSG_IMU) return;
      const imu = decodeImu(frame.payload);
      const mag = accelMagnitude(imu.accel);
      setSample(imu);
      setMagnitude(mag);
      const th = threshRef.current;
      if (mag < th * 0.7) {
        belowRef.current = true;
        return;
      }
      if (!belowRef.current || mag < th || busyRef.current) return;
      belowRef.current = false;
      setShakeCount((n) => n + 1);
      busyRef.current = true;
      void writeAcked(MSG_SFX_CMD, encodeSfxPlay(SFX_PRESET.BEEP, { volume: 10 }))
        .catch(() => undefined)
        .finally(() => {
          busyRef.current = false;
        });
    });
  }, [ready, subscribe, writeAcked]);

  const imuMessage =
    session.status !== "open"
      ? null
      : !imuSupported
        ? "No IMU — switch WORKSHOP_BOARD_ID to ws28p."
        : !ready
          ? "Waiting for the board to settle…"
          : sample
            ? "Shake the board — Beep on peak."
            : "Waiting for Imu…";

  return {
    status: session.status,
    message: session.message,
    supported: session.supported,
    serialSupported: session.serialSupported,
    bleSupported: session.bleSupported,
    transport: session.transport,
    port: session.port,
    ready: session.ready,
    connect,
    connectSerial,
    connectBle,
    disconnect,
    imuSupported,
    sample,
    magnitude,
    shakeCount,
    shakeThreshold,
    setShakeThreshold,
    resetShake,
    imuMessage,
  };
}
