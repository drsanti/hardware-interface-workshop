import { useCallback, useEffect, useState } from "react";

import { useSerialSession, type SerialSessionState } from "@/hooks/useSerialSession";
import {
  MSG_BATTERY,
  decodeBatteryStatus,
  type BatteryStatusView,
} from "@/lib/wire/battery";
import { CAP, boardHas } from "@/lib/workshop";

export type BatteryState = Pick<
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
  battSupported: boolean;
  battery: BatteryStatusView | null;
  updatedAt: number | null;
  battMessage: string | null;
};

/** Listen for BatteryStatus (0x25) — board pushes ~every 10 s. */
export function useBattery(): BatteryState {
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

  const battSupported = boardHas(CAP.BATT);
  const [battery, setBattery] = useState<BatteryStatusView | null>(null);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);

  const connect = useCallback(async () => {
    setBattery(null);
    setUpdatedAt(null);
    await connectPort();
  }, [connectPort]);
  const connectSerial = useCallback(async () => {
    setBattery(null);
    setUpdatedAt(null);
    await connectSerialPort();
  }, [connectSerialPort]);

  const connectBle = useCallback(async () => {
    setBattery(null);
    setUpdatedAt(null);
    await connectBlePort();
  }, [connectBlePort]);


  const disconnect = useCallback(async () => {
    setBattery(null);
    setUpdatedAt(null);
    await disconnectPort();
  }, [disconnectPort]);

  useEffect(() => {
    if (!ready) return;
    return subscribe((frame) => {
      if (frame.msgType !== MSG_BATTERY) return;
      setBattery(decodeBatteryStatus(frame.payload));
      setUpdatedAt(Date.now());
    });
  }, [ready, subscribe]);

  const battMessage =
    status !== "open"
      ? null
      : !battSupported
        ? "This board target reports no battery ADC (CAP.BATT)."
        : !ready
          ? "Waiting for the board to settle…"
          : battery
            ? "Battery updates ~every 10 s."
            : "Waiting for first BatteryStatus…";

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
    battSupported,
    battery,
    updatedAt,
    battMessage,
  };
}
