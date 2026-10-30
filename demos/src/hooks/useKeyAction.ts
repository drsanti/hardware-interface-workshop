import { useCallback, useEffect, useState } from "react";

import { useAckedWrite } from "@/hooks/useAckedWrite";
import { useSerialSession, type SerialSessionState } from "@/hooks/useSerialSession";
import {
  KEY_EV,
  MSG_KEY_EVENT,
  decodeKeyEvent,
  keyLabel,
  type KeyEventView,
} from "@/lib/wire/key";
import { encodeLedOff, encodeLedSolid, MSG_LED_FX, type Rgb } from "@/lib/wire/led";
import { encodeSfxPlay, MSG_SFX_CMD, SFX_PRESET } from "@/lib/wire/sfx";
import { CAP, boardHas } from "@/lib/workshop";

const GREEN: Rgb = { r: 0, g: 180, b: 60 };
const HISTORY = 8;

export type KeyActionState = Pick<
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
  ledSupported: boolean;
  last: KeyEventView | null;
  events: KeyEventView[];
  actionHint: string | null;
  keyMessage: string | null;
  clear: () => void;
};

/**
 * ex17 — SHORT press → Beep (+ green LED pulse when CAP.LED).
 * One serial session for keys + actuators.
 */
export function useKeyAction(): KeyActionState {
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

  const btnSupported = boardHas(CAP.BTN);
  const ledSupported = boardHas(CAP.LED);
  const [last, setLast] = useState<KeyEventView | null>(null);
  const [events, setEvents] = useState<KeyEventView[]>([]);
  const [actionHint, setActionHint] = useState<string | null>(null);

  const resetUi = useCallback(() => {
    setLast(null);
    setEvents([]);
    setActionHint(null);
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
    resetUi();
    await disconnectPort();
  }, [clearPending, disconnectPort, resetUi]);

  const clear = useCallback(() => {
    setLast(null);
    setEvents([]);
    setActionHint(null);
  }, []);

  useEffect(() => {
    if (!ready) return;
    return subscribe((frame) => {
      if (frame.msgType !== MSG_KEY_EVENT) return;
      const ev = decodeKeyEvent(frame.payload);
      setLast(ev);
      setEvents((prev) => [ev, ...prev].slice(0, HISTORY));

      if (ev.event !== KEY_EV.SHORT) return;
      void (async () => {
        try {
          await writeAcked(MSG_SFX_CMD, encodeSfxPlay(SFX_PRESET.BEEP, { volume: 10 }));
          if (ledSupported) {
            await writeAcked(MSG_LED_FX, encodeLedSolid(GREEN));
            await new Promise((r) => setTimeout(r, 200));
            await writeAcked(MSG_LED_FX, encodeLedOff());
          }
          setActionHint(
            `${keyLabel(ev.key)} SHORT → Beep${ledSupported ? " + LED flash" : ""}`,
          );
        } catch {
          /* replaced / disconnect */
        }
      })();
    });
  }, [ledSupported, ready, subscribe, writeAcked]);

  const keyMessage =
    session.status !== "open"
      ? null
      : !btnSupported
        ? "No CAP.BTN on this target."
        : !ready
          ? "Waiting for the board to settle…"
          : "SHORT press → Beep" + (ledSupported ? " + green flash" : "");

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
    btnSupported,
    ledSupported,
    last,
    events,
    actionHint,
    keyMessage,
    clear,
  };
}
