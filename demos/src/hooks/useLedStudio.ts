import { useCallback, useEffect, useRef, useState } from "react";

import { useSerialSession, type SerialSessionState } from "@/hooks/useSerialSession";
import {
  LED_FX_PRESETS,
  MSG_CMD_ACK,
  MSG_LED_FX,
  MSG_LED_STATE,
  decodeCmdAck,
  decodeLedState,
  encodeLedOff,
  encodeLedSolid,
  type LedFxPresetId,
  type Rgb,
} from "@/lib/wire/led";
import { CAP, boardHas } from "@/lib/workshop";

const SLIDER_DEBOUNCE_MS = 120;

export type LedStudioMode = "solid" | LedFxPresetId | "off";

export type LedStudioState = Pick<
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
  ledSupported: boolean;
  /** Local slider RGB (always present for the studio UI). */
  rgb: Rgb;
  commanded: Rgb | null;
  echoed: Rgb | null;
  mode: LedStudioMode | null;
  ledMessage: string | null;
  setChannel: (channel: keyof Rgb, value: number) => void;
  applySolid: (rgb?: Rgb) => Promise<void>;
  applyFx: (id: LedFxPresetId) => Promise<void>;
  turnOff: () => Promise<void>;
};

const DEFAULT_RGB: Rgb = { r: 255, g: 64, b: 0 };

/** Serial session + RGB sliders + LedFx motion presets (ex05). */
export function useLedStudio(): LedStudioState {
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
  const [rgb, setRgb] = useState<Rgb>(DEFAULT_RGB);
  const [commanded, setCommanded] = useState<Rgb | null>(null);
  const [echoed, setEchoed] = useState<Rgb | null>(null);
  const [mode, setMode] = useState<LedStudioMode | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const pendingAck = useRef<{
    seq: number;
    resolve: (rc: number) => void;
    reject: (err: Error) => void;
    timer: ReturnType<typeof setTimeout>;
  } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rgbRef = useRef(rgb);
  rgbRef.current = rgb;

  const connect = useCallback(async () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    setCommanded(null);
    setEchoed(null);
    setMode(null);
    setActionMessage(null);
    await connectPort();
  }, [connectPort]);
  const connectSerial = useCallback(async () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    setCommanded(null);
    setEchoed(null);
    setMode(null);
    setActionMessage(null);
    await connectSerialPort();
  }, [connectSerialPort]);

  const connectBle = useCallback(async () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    setCommanded(null);
    setEchoed(null);
    setMode(null);
    setActionMessage(null);
    await connectBlePort();
  }, [connectBlePort]);


  const disconnect = useCallback(async () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    if (pendingAck.current) {
      clearTimeout(pendingAck.current.timer);
      pendingAck.current.reject(new Error("Disconnected."));
      pendingAck.current = null;
    }
    setCommanded(null);
    setEchoed(null);
    setMode(null);
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

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (pendingAck.current) clearTimeout(pendingAck.current.timer);
    };
  }, []);

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

  const applySolid = useCallback(
    async (next?: Rgb) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      const color = next ?? rgbRef.current;
      if (next) {
        setRgb(color);
        rgbRef.current = color;
      }
      try {
        await sendLedFx(encodeLedSolid(color), "Solid color set.");
        setCommanded(color);
        setMode("solid");
      } catch (err) {
        if (err instanceof Error && err.message.startsWith("Replaced")) return;
        setActionMessage(err instanceof Error ? err.message : "Send failed.");
      }
    },
    [sendLedFx],
  );

  const setChannel = useCallback(
    (channel: keyof Rgb, value: number) => {
      const clamped = Math.max(0, Math.min(255, Math.round(value)));
      setRgb((prev) => {
        const next = { ...prev, [channel]: clamped };
        rgbRef.current = next;
        return next;
      });
      if (!ready || !ledSupported) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        void applySolid(rgbRef.current);
      }, SLIDER_DEBOUNCE_MS);
    },
    [applySolid, ledSupported, ready],
  );

  const applyFx = useCallback(
    async (id: LedFxPresetId) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      const preset = LED_FX_PRESETS.find((p) => p.id === id);
      if (!preset) return;
      const color = rgbRef.current;
      try {
        await sendLedFx(preset.encode(color), `${preset.label} started.`);
        if (id !== "rainbow") setCommanded(color);
        setMode(id);
      } catch (err) {
        if (err instanceof Error && err.message.startsWith("Replaced")) return;
        setActionMessage(err instanceof Error ? err.message : "Send failed.");
      }
    },
    [sendLedFx],
  );

  const turnOff = useCallback(async () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    try {
      await sendLedFx(encodeLedOff(), "LED off.");
      setCommanded({ r: 0, g: 0, b: 0 });
      setMode("off");
    } catch (err) {
      if (err instanceof Error && err.message.startsWith("Replaced")) return;
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
          : "Ready — drag sliders or pick a preset.");

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
    rgb,
    commanded,
    echoed,
    mode,
    ledMessage,
    setChannel,
    applySolid,
    applyFx,
    turnOff,
  };
}
