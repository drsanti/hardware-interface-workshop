import { useCallback, useEffect, useState } from "react";

import { useSerialSession, type SerialSessionState } from "@/hooks/useSerialSession";
import { MSG_BOARD_INFO, decodeBoardInfo, wireSelfCheck, type BoardInfoView } from "@/lib/wire";

export type BoardHelloState = Pick<
  SerialSessionState,
  | "status"
  | "message"
  | "supported"
  | "serialSupported"
  | "bleSupported"
  | "transport"
  | "port"
  | "connect"
  | "connectSerial"
  | "connectBle"
  | "disconnect"
> & {
  info: BoardInfoView | null;
  listenMessage: string | null;
  decoderOk: boolean;
};

/** Open USB and wait for the board identity message. */
export function useBoardHello(): BoardHelloState {
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

  const [info, setInfo] = useState<BoardInfoView | null>(null);
  const [decoderOk] = useState(() => wireSelfCheck());

  const connect = useCallback(async () => {
    setInfo(null);
    await connectPort();
  }, [connectPort]);
  const connectSerial = useCallback(async () => {
    setInfo(null);
    await connectSerialPort();
  }, [connectSerialPort]);

  const connectBle = useCallback(async () => {
    setInfo(null);
    await connectBlePort();
  }, [connectBlePort]);


  const disconnect = useCallback(async () => {
    setInfo(null);
    await disconnectPort();
  }, [disconnectPort]);

  useEffect(() => {
    if (!ready) return;
    return subscribe((frame) => {
      if (frame.msgType !== MSG_BOARD_INFO) return;
      setInfo(decodeBoardInfo(frame.payload));
    });
  }, [ready, subscribe]);

  const listenMessage =
    status !== "open"
      ? null
      : info
        ? "Board said hello."
        : !decoderOk
          ? "Decoder self-check failed — check lib/wire."
          : !ready
            ? "Waiting for the board to settle, then listening…"
            : "Listening for the board identity message…";

  return {
    status,
    message,
    supported,
    serialSupported,
    bleSupported,
    transport,
    port,
    connect,
    connectSerial,
    connectBle,
    disconnect,
    info,
    listenMessage,
    decoderOk,
  };
}
