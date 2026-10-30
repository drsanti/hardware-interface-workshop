import { useCallback, useEffect, useRef, useState } from "react";

import { useAckedWrite } from "@/hooks/useAckedWrite";
import { useSerialSession, type SerialSessionState } from "@/hooks/useSerialSession";
import {
  MSG_AUDIO_LEVEL,
  MSG_MIC_CMD,
  decodeAudioLevel,
  encodeMicCmd,
  levelToPercent,
  type AudioLevelView,
} from "@/lib/wire/mic";
import { encodeLedOff, encodeLedSolid, MSG_LED_FX, type Rgb } from "@/lib/wire/led";
import { CAP, boardHas } from "@/lib/workshop";

export type SoundLedState = Pick<
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
  micSupported: boolean;
  ledSupported: boolean;
  enabled: boolean;
  level: AudioLevelView | null;
  ledRgb: Rgb;
  soundMessage: string | null;
  enable: (on: boolean) => Promise<void>;
};

function levelToRgb(pct: number): Rgb {
  /* Quiet → blue-ish; loud → green → yellow → red */
  if (pct < 25) return { r: 20, g: 40, b: 120 + Math.round(pct * 2) };
  if (pct < 55) return { r: 20, g: 80 + Math.round(pct), b: 40 };
  if (pct < 80) return { r: 120 + Math.round(pct), g: 140, b: 10 };
  return { r: 220, g: Math.max(0, 180 - Math.round(pct)), b: 10 };
}

/** ex23 — AudioLevel → RGB LED (one session). */
export function useSoundLed(): SoundLedState {
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

  const micSupported = boardHas(CAP.MIC);
  const ledSupported = boardHas(CAP.LED);
  const [enabled, setEnabled] = useState(false);
  const [level, setLevel] = useState<AudioLevelView | null>(null);
  const [ledRgb, setLedRgb] = useState<Rgb>({ r: 0, g: 0, b: 0 });
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const lastSent = useRef(0);

  const resetUi = useCallback(() => {
    setEnabled(false);
    setLevel(null);
    setLedRgb({ r: 0, g: 0, b: 0 });
    setActionMessage(null);
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
    setEnabled(false);
    setLevel(null);
    await disconnectPort();
  }, [clearPending, disconnectPort]);

  useEffect(() => {
    if (!ready) return;
    return subscribe((frame) => {
      if (frame.msgType !== MSG_AUDIO_LEVEL) return;
      const lv = decodeAudioLevel(frame.payload);
      setLevel(lv);
      if (!ledSupported || !enabled) return;
      const pct = levelToPercent(lv.peak || lv.rms);
      const rgb = levelToRgb(pct);
      setLedRgb(rgb);
      const now = Date.now();
      if (now - lastSent.current < 80) return;
      lastSent.current = now;
      void writeAcked(MSG_LED_FX, encodeLedSolid(rgb)).catch(() => undefined);
    });
  }, [enabled, ledSupported, ready, subscribe, writeAcked]);

  const enable = useCallback(
    async (on: boolean) => {
      if (!micSupported) {
        setActionMessage("No mic on this target.");
        return;
      }
      try {
        const rc = await writeAcked(
          MSG_MIC_CMD,
          encodeMicCmd(on ? { enable: true, gainPct: 70 } : { enable: false }),
        );
        if (rc !== 0) {
          setActionMessage(`MicCmd rejected (rc=${rc}).`);
          return;
        }
        setEnabled(on);
        if (!on && ledSupported) {
          await writeAcked(MSG_LED_FX, encodeLedOff());
          setLedRgb({ r: 0, g: 0, b: 0 });
        }
        setActionMessage(on ? "Mic on — LED follows level." : "Mic off.");
      } catch (err) {
        if (err instanceof Error && err.message.startsWith("Replaced")) return;
        setActionMessage(err instanceof Error ? err.message : "Failed.");
      }
    },
    [ledSupported, micSupported, writeAcked],
  );

  const soundMessage =
    actionMessage ??
    (session.status !== "open"
      ? null
      : !micSupported || !ledSupported
        ? "Needs es3c28p (MIC + LED)."
        : !ready
          ? "Waiting for the board to settle…"
          : "Enable mic — LED color tracks AudioLevel.");

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
    micSupported,
    ledSupported,
    enabled,
    level,
    ledRgb,
    soundMessage,
    enable,
  };
}
