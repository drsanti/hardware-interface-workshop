import { useCallback, useEffect, useRef, useState } from "react";

import { useAckedWrite } from "@/hooks/useAckedWrite";
import { useSerialSession, type SerialSessionState } from "@/hooks/useSerialSession";
import {
  MSG_KEY_EVENT,
  decodeKeyEvent,
  type KeyEventView,
} from "@/lib/wire/key";
import { encodeSfxParam, MSG_SFX_PARAM } from "@/lib/wire/sfx";
import { CAP, boardHas } from "@/lib/workshop";

const HISTORY = 12;
/** Desk-safe master — board BOOT chirp uses vol=0 (keep last master). */
const QUIET_MASTER = 10;

export type KeyState = Pick<
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
  btnSupported: boolean;
  last: KeyEventView | null;
  events: KeyEventView[];
  keyMessage: string | null;
  clear: () => void;
};

/** Listen for KeyEvent (0x2c) — no host enable command. */
export function useKey(): KeyState {
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
  const btnSupported = boardHas(CAP.BTN);
  const [last, setLast] = useState<KeyEventView | null>(null);
  const [events, setEvents] = useState<KeyEventView[]>([]);
  const quietApplied = useRef(false);

  const connect = useCallback(async () => {
    quietApplied.current = false;
    setLast(null);
    setEvents([]);
    await connectPort();
  }, [connectPort]);
  const connectSerial = useCallback(async () => {
    quietApplied.current = false;
    setLast(null);
    setEvents([]);
    await connectSerialPort();
  }, [connectSerialPort]);

  const connectBle = useCallback(async () => {
    quietApplied.current = false;
    setLast(null);
    setEvents([]);
    await connectBlePort();
  }, [connectBlePort]);


  const disconnect = useCallback(async () => {
    clearPending();
    quietApplied.current = false;
    setLast(null);
    setEvents([]);
    await disconnectPort();
  }, [clearPending, disconnectPort]);

  const clear = useCallback(() => {
    setLast(null);
    setEvents([]);
  }, []);

  /* BOOT/PWR chirps are played on-board with volume 0 (= keep master).
   * Force a quiet master so ex16 is desk-safe after loud SFX labs. */
  useEffect(() => {
    if (!ready || quietApplied.current) return;
    quietApplied.current = true;
    void writeAcked(MSG_SFX_PARAM, encodeSfxParam(0xff, 0, QUIET_MASTER)).catch(
      () => undefined,
    );
  }, [ready, writeAcked]);

  useEffect(() => {
    if (!ready) return;
    return subscribe((frame) => {
      if (frame.msgType !== MSG_KEY_EVENT) return;
      const ev = decodeKeyEvent(frame.payload);
      setLast(ev);
      setEvents((prev) => [ev, ...prev].slice(0, HISTORY));
    });
  }, [ready, subscribe]);

  const keyMessage =
    status !== "open"
      ? null
      : !btnSupported
        ? "This board target reports no buttons (CAP.BTN)."
        : !ready
          ? "Waiting for the board to settle…"
          : last
            ? "Listening — press a board button."
            : "Ready — press BOOT (or PWR on ws28p).";

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
    btnSupported,
    last,
    events,
    keyMessage,
    clear,
  };
}
