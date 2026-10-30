import { useCallback, useEffect, useRef, useState } from "react";

import { useSerialSession, type SerialSessionState } from "@/hooks/useSerialSession";
import {
  MSG_IMU,
  accelMagnitude,
  decodeImu,
  type ImuView,
} from "@/lib/wire/imu";
import { CAP, boardHas } from "@/lib/workshop";

export type ImuState = Pick<
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
  /** Rising edge when |a| exceeds threshold after being below. */
  shakeCount: number;
  shakeThreshold: number;
  setShakeThreshold: (n: number) => void;
  resetShake: () => void;
  imuMessage: string | null;
};

/** Listen for Imu (0x20) @ ~50 Hz — ws28p only. */
export function useImu(): ImuState {
  const {
    status,
    message,
    supported,
    transport,
    bleSupported,
    serialSupported,
    port,
    ready,
    connect: connectPort,
    connectBle: connectBlePort,
    connectSerial: connectSerialPort,
    disconnect: disconnectPort,
    subscribe,
  } = useSerialSession();

  const imuSupported = boardHas(CAP.IMU);
  const [sample, setSample] = useState<ImuView | null>(null);
  const [magnitude, setMagnitude] = useState(0);
  const [shakeCount, setShakeCount] = useState(0);
  const [shakeThreshold, setShakeThreshold] = useState(18);
  const belowRef = useRef(true);
  const threshRef = useRef(shakeThreshold);
  threshRef.current = shakeThreshold;

  const connect = useCallback(async () => {
    setSample(null);
    setMagnitude(0);
    setShakeCount(0);
    belowRef.current = true;
    await connectPort();
  }, [connectPort]);
  const connectSerial = useCallback(async () => {
    setSample(null);
    setMagnitude(0);
    setShakeCount(0);
    belowRef.current = true;
    await connectSerialPort();
  }, [connectSerialPort]);

  const connectBle = useCallback(async () => {
    setSample(null);
    setMagnitude(0);
    setShakeCount(0);
    belowRef.current = true;
    await connectBlePort();
  }, [connectBlePort]);


  const disconnect = useCallback(async () => {
    setSample(null);
    setMagnitude(0);
    await disconnectPort();
  }, [disconnectPort]);

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
      } else if (belowRef.current && mag >= th) {
        belowRef.current = false;
        setShakeCount((n) => n + 1);
      }
    });
  }, [ready, subscribe]);

  const imuMessage =
    status !== "open"
      ? null
      : !imuSupported
        ? "No IMU on this target — set WORKSHOP_BOARD_ID to ws28p."
        : !ready
          ? "Waiting for the board to settle…"
          : sample
            ? "IMU streaming (~50 Hz)."
            : "Waiting for first Imu sample…";

  return {
    status,
    message,
    supported,
    serialSupported,
    bleSupported,
    transport,
    port,
    ready,
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
