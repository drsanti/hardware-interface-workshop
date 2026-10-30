import { useCallback, useEffect, useRef, useState } from "react";

import { useAckedWrite } from "@/hooks/useAckedWrite";
import { useSerialSession, type SerialSessionState } from "@/hooks/useSerialSession";
import {
  KEY_EV,
  MSG_KEY_EVENT,
  decodeKeyEvent,
  keyLabel,
  type KeyEventView,
} from "@/lib/wire/key";
import {
  encodeLedOff,
  encodeLedSolid,
  MSG_LED_FX,
  type Rgb,
} from "@/lib/wire/led";
import {
  encodeSfxPlay,
  encodeSfxStop,
  MSG_SFX_CMD,
  SFX_PRESET,
} from "@/lib/wire/sfx";
import { CAP, boardHas } from "@/lib/workshop";

const COLORS: Rgb[] = [
  { r: 220, g: 40, b: 40 },
  { r: 40, g: 180, b: 60 },
  { r: 40, g: 100, b: 220 },
  { r: 220, g: 160, b: 20 },
];

export type ApplianceState = Pick<
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
  colorIndex: number;
  actionHint: string | null;
  appMessage: string | null;
  clear: () => void;
};

/**
 * ex24 mini appliance:
 * SHORT → next LED color + Beep
 * DOUBLE → Chime
 * LONG → Stop + LED off
 */
export function useAppliance(): ApplianceState {
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
  const [colorIndex, setColorIndex] = useState(0);
  const colorRef = useRef(0);
  const [actionHint, setActionHint] = useState<string | null>(null);

  const resetUi = useCallback(() => {
    setLast(null);
    setEvents([]);
    setColorIndex(0);
    colorRef.current = 0;
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
      setEvents((prev) => [ev, ...prev].slice(0, 10));

      void (async () => {
        try {
          if (ev.event === KEY_EV.SHORT) {
            const next = (colorRef.current + 1) % COLORS.length;
            colorRef.current = next;
            setColorIndex(next);
            await writeAcked(MSG_SFX_CMD, encodeSfxPlay(SFX_PRESET.BEEP, { volume: 10 }));
            if (ledSupported) {
              await writeAcked(MSG_LED_FX, encodeLedSolid(COLORS[next]!));
            }
            setActionHint(`${keyLabel(ev.key)} SHORT → color ${next + 1} + Beep`);
          } else if (ev.event === KEY_EV.DOUBLE) {
            await writeAcked(MSG_SFX_CMD, encodeSfxPlay(SFX_PRESET.CHIME, { volume: 10 }));
            setActionHint(`${keyLabel(ev.key)} DOUBLE → Chime`);
          } else if (ev.event === KEY_EV.LONG) {
            await writeAcked(MSG_SFX_CMD, encodeSfxStop());
            if (ledSupported) await writeAcked(MSG_LED_FX, encodeLedOff());
            setActionHint(`${keyLabel(ev.key)} LONG → Stop + LED off`);
          }
        } catch {
          /* ignore */
        }
      })();
    });
  }, [ledSupported, ready, subscribe, writeAcked]);

  const appMessage =
    session.status !== "open"
      ? null
      : !btnSupported
        ? "Needs CAP.BTN."
        : !ready
          ? "Waiting for the board to settle…"
          : "SHORT=color+Beep · DOUBLE=Chime · LONG=Stop";

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
    colorIndex,
    actionHint,
    appMessage,
    clear,
  };
}
