import { useCallback, useEffect, useRef, useState } from "react";

import { useSerialSession, type SerialSessionState } from "@/hooks/useSerialSession";
import {
  MSG_CMD_ACK,
  MSG_LED_FX,
  MSG_LED_STATE,
  decodeCmdAck,
  decodeLedState,
  encodeLedOff,
  encodeLedSolid,
  type Rgb,
} from "@/lib/wire/led";
import { CAP, boardHas } from "@/lib/workshop";

export type LedControlState = Pick<
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
  /** Workshop target includes an RGB LED. */
  ledSupported: boolean;
  /** Last color we sent (optimistic). */
  commanded: Rgb | null;
  /** Last color the board echoed. */
  echoed: Rgb | null;
  /** Short status under the LED controls. */
  ledMessage: string | null;
  setColor: (rgb: Rgb) => Promise<void>;
  turnOff: () => Promise<void>;
};

/** Serial session + LED command helpers (es3c28p). */
export function useLedControl(): LedControlState {
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

  const ledSupported = boardHas(CAP.LED);
  const [commanded, setCommanded] = useState<Rgb | null>(null);
  const [echoed, setEchoed] = useState<Rgb | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const pendingAck = useRef<{
    seq: number;
    resolve: (rc: number) => void;
    reject: (err: Error) => void;
    timer: ReturnType<typeof setTimeout>;
  } | null>(null);

  const connect = useCallback(async () => {
    setCommanded(null);
    setEchoed(null);
    setActionMessage(null);
    await connectPort();
  }, [connectPort]);
  const connectSerial = useCallback(async () => {
    setCommanded(null);
    setEchoed(null);
    setActionMessage(null);
    await connectSerialPort();
  }, [connectSerialPort]);

  const connectBle = useCallback(async () => {
    setCommanded(null);
    setEchoed(null);
    setActionMessage(null);
    await connectBlePort();
  }, [connectBlePort]);


  const disconnect = useCallback(async () => {
    if (pendingAck.current) {
      clearTimeout(pendingAck.current.timer);
      pendingAck.current.reject(new Error("Disconnected."));
      pendingAck.current = null;
    }
    setCommanded(null);
    setEchoed(null);
    setActionMessage(null);
    await disconnectPort();
  }, [disconnectPort]);

  useEffect(() => {
    if (!ready) return;
    return subscribe((frame) => {
      if (frame.msgType === MSG_LED_STATE) {
        setEchoed(decodeLedState(frame.payload));
        return;
      }
      if (frame.msgType !== MSG_CMD_ACK) return;
      const ack = decodeCmdAck(frame.payload);
      if (ack.msgType !== MSG_LED_FX) return;
      const pending = pendingAck.current;
      if (!pending) return;
      if ((ack.reqSeq & 0xffff) !== (pending.seq & 0xffff)) return;
      clearTimeout(pending.timer);
      pendingAck.current = null;
      pending.resolve(ack.rc);
    });
  }, [ready, subscribe]);

  const sendLedFx = useCallback(
    async (payload: Uint8Array, okMessage: string) => {
      if (!ledSupported) {
        setActionMessage("No RGB LED on this board target.");
        return;
      }
      if (!ready) {
        setActionMessage("Wait until the port has settled.");
        return;
      }

      const seq = await writeFrame(MSG_LED_FX, payload);

      const rc = await new Promise<number>((resolve, reject) => {
        if (pendingAck.current) {
          clearTimeout(pendingAck.current.timer);
          pendingAck.current.reject(new Error("Replaced by a newer command."));
        }
        const timer = setTimeout(() => {
          pendingAck.current = null;
          reject(new Error("No reply from board — is serial-bridge firmware on the board?"));
        }, 2500);
        pendingAck.current = { seq, resolve, reject, timer };
      });

      if (rc !== 0) {
        setActionMessage(`Board rejected command (rc=${rc}).`);
        return;
      }
      setActionMessage(okMessage);
    },
    [ledSupported, ready, writeFrame],
  );

  const setColor = useCallback(
    async (rgb: Rgb) => {
      try {
        await sendLedFx(encodeLedSolid(rgb), "Color set.");
        setCommanded(rgb);
      } catch (err) {
        setActionMessage(err instanceof Error ? err.message : "Send failed.");
      }
    },
    [sendLedFx],
  );

  const turnOff = useCallback(async () => {
    try {
      await sendLedFx(encodeLedOff(), "LED off.");
      setCommanded({ r: 0, g: 0, b: 0 });
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "Send failed.");
    }
  }, [sendLedFx]);

  const ledMessage =
    actionMessage ??
    (status !== "open"
      ? null
      : !ledSupported
        ? "This workshop board target has no RGB LED — switch to es3c28p."
        : !ready
          ? "Waiting for the board to settle…"
          : "Ready — pick a color.");

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
    ledSupported,
    commanded,
    echoed,
    ledMessage,
    setColor,
    turnOff,
  };
}
