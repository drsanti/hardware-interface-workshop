import { useCallback, useEffect, useState } from "react";

import { useAckedWrite } from "@/hooks/useAckedWrite";
import { useSerialSession, type SerialSessionState } from "@/hooks/useSerialSession";
import { decodeBoardInfo, type BoardInfoView } from "@/lib/wire/boardInfo";
import { MSG_BOARD_INFO } from "@/lib/wire/frame";
import { MSG_TIME_SYNC, encodeTimeSync } from "@/lib/wire/time";
import { CAP, boardHas } from "@/lib/workshop";

export type RtcState = Pick<
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
  rtcSupported: boolean;
  info: BoardInfoView | null;
  rtcMessage: string | null;
  syncNow: () => Promise<void>;
};

/**
 * RTC lab: TimeSync (0x8b) + BoardInfo unix_ns / synced.
 * Hardware persist needs CAP.RTC (ws28p); soft sync works on both.
 */
export function useRtc(): RtcState {
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
    writeFrame,
  } = useSerialSession();

  const { writeAcked, clearPending } = useAckedWrite(ready, subscribe, writeFrame);
  const rtcSupported = boardHas(CAP.RTC);
  const [info, setInfo] = useState<BoardInfoView | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const connect = useCallback(async () => {
    setInfo(null);
    setActionMessage(null);
    await connectPort();
  }, [connectPort]);
  const connectSerial = useCallback(async () => {
    setInfo(null);
    setActionMessage(null);
    await connectSerialPort();
  }, [connectSerialPort]);

  const connectBle = useCallback(async () => {
    setInfo(null);
    setActionMessage(null);
    await connectBlePort();
  }, [connectBlePort]);


  const disconnect = useCallback(async () => {
    clearPending();
    setInfo(null);
    setActionMessage(null);
    await disconnectPort();
  }, [clearPending, disconnectPort]);

  useEffect(() => {
    if (!ready) return;
    return subscribe((frame) => {
      if (frame.msgType !== MSG_BOARD_INFO) return;
      setInfo(decodeBoardInfo(frame.payload));
    });
  }, [ready, subscribe]);

  const syncNow = useCallback(async () => {
    if (!ready) {
      setActionMessage("Wait until the port has settled.");
      return;
    }
    try {
      const rc = await writeAcked(MSG_TIME_SYNC, encodeTimeSync());
      if (rc !== 0) {
        setActionMessage(`TimeSync rejected (rc=${rc}).`);
        return;
      }
      setActionMessage(
        rtcSupported
          ? "Clock synced (and RTC persisted on ws28p)."
          : "Soft clock synced (no hardware RTC on this target).",
      );
    } catch (err) {
      if (err instanceof Error && err.message.startsWith("Replaced")) return;
      setActionMessage(err instanceof Error ? err.message : "TimeSync failed.");
    }
  }, [ready, rtcSupported, writeAcked]);

  const rtcMessage =
    actionMessage ??
    (status !== "open"
      ? null
      : !ready
        ? "Waiting for the board to settle…"
        : info?.synced
          ? "Board reports synced — Sync again to refresh."
          : "Ready — press Sync now to send TimeSync.");

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
    rtcSupported,
    info,
    rtcMessage,
    syncNow,
  };
}
