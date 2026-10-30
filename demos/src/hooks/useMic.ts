import { useCallback, useEffect, useRef, useState } from "react";

import { useAckedWrite } from "@/hooks/useAckedWrite";
import { useSerialSession, type SerialSessionState } from "@/hooks/useSerialSession";
import type { DecodedFrame } from "@/lib/wire";
import {
  MSG_AUDIO_LEVEL,
  MSG_MIC_CMD,
  MSG_MIC_PCM,
  decodeAudioLevel,
  decodeMicPcm,
  encodeMicCmd,
  type AudioLevelView,
} from "@/lib/wire/mic";
import { CAP, boardHas } from "@/lib/workshop";

const PCM_HISTORY = 320;

export type MicState = Pick<
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
  enabled: boolean;
  muted: boolean;
  streaming: boolean;
  gainPct: number;
  level: AudioLevelView | null;
  /** Recent signed samples (−1..1) for the scope; UI auto-gains for speech. */
  waveform: Float32Array;
  micMessage: string | null;
  setGainPct: (n: number) => void;
  enable: (on: boolean) => Promise<void>;
  setMute: (on: boolean) => Promise<void>;
  setStream: (on: boolean) => Promise<void>;
  applyGain: (pct?: number) => Promise<void>;
  /** Live MicPcm chunks (int16) — FFT / recorder labs subscribe here. */
  subscribePcm: (handler: (samples: Int16Array) => void) => () => void;
  /** Raw board frames — multi-sensor labs that share the mic session. */
  subscribe: (handler: (frame: DecodedFrame) => void) => () => void;
  /** Acked board write — for actuator labs that share the mic session. */
  writeAcked: (msgType: number, payload: Uint8Array) => Promise<number>;
};

/** Shared mic session for ex11–ex15 (`es3c28p`). */
export function useMic(): MicState {
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
  const micSupported = boardHas(CAP.MIC);
  const [enabled, setEnabled] = useState(false);
  const [muted, setMuted] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [gainPct, setGainPct] = useState(60);
  const [level, setLevel] = useState<AudioLevelView | null>(null);
  const [waveform, setWaveform] = useState(() => new Float32Array(PCM_HISTORY));
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const waveRef = useRef(new Float32Array(PCM_HISTORY));
  const pcmHandlersRef = useRef(new Set<(samples: Int16Array) => void>());

  const subscribePcm = useCallback((handler: (samples: Int16Array) => void) => {
    pcmHandlersRef.current.add(handler);
    return () => {
      pcmHandlersRef.current.delete(handler);
    };
  }, []);

  const connect = useCallback(async () => {
    setEnabled(false);
    setMuted(false);
    setStreaming(false);
    setLevel(null);
    waveRef.current.fill(0);
    setWaveform(new Float32Array(PCM_HISTORY));
    setActionMessage(null);
    await connectPort();
  }, [connectPort]);
  const connectSerial = useCallback(async () => {
    setEnabled(false);
    setMuted(false);
    setStreaming(false);
    setLevel(null);
    waveRef.current.fill(0);
    setWaveform(new Float32Array(PCM_HISTORY));
    setActionMessage(null);
    await connectSerialPort();
  }, [connectSerialPort]);

  const connectBle = useCallback(async () => {
    setEnabled(false);
    setMuted(false);
    setStreaming(false);
    setLevel(null);
    waveRef.current.fill(0);
    setWaveform(new Float32Array(PCM_HISTORY));
    setActionMessage(null);
    await connectBlePort();
  }, [connectBlePort]);


  const disconnect = useCallback(async () => {
    clearPending();
    setEnabled(false);
    setMuted(false);
    setStreaming(false);
    setLevel(null);
    setActionMessage(null);
    await disconnectPort();
  }, [clearPending, disconnectPort]);

  useEffect(() => {
    if (!ready) return;
    return subscribe((frame) => {
      if (frame.msgType === MSG_AUDIO_LEVEL) {
        setLevel(decodeAudioLevel(frame.payload));
        return;
      }
      if (frame.msgType !== MSG_MIC_PCM) return;
      const pcm = decodeMicPcm(frame.payload);
      for (const handler of pcmHandlersRef.current) handler(pcm.samples);
      const hist = waveRef.current;
      /* Keep enough points per chunk for a readable scope (~64). */
      const step = Math.max(1, Math.floor(pcm.samples.length / 64));
      for (let i = 0; i < pcm.samples.length; i += step) {
        /* Signed −1..1 — WaveStrip auto-gains so speech fills the view. */
        const v = (pcm.samples[i] ?? 0) / 32768;
        hist.copyWithin(0, 1);
        hist[hist.length - 1] = v;
      }
      setWaveform(Float32Array.from(hist));
    });
  }, [ready, subscribe]);

  const run = useCallback(
    async (payload: Uint8Array, ok: string) => {
      if (!micSupported) {
        setActionMessage("No microphone on this board target.");
        return;
      }
      if (!ready) {
        setActionMessage("Wait until the port has settled.");
        return;
      }
      try {
        const rc = await writeAcked(MSG_MIC_CMD, payload);
        if (rc !== 0) {
          setActionMessage(`Board rejected command (rc=${rc}).`);
          return;
        }
        setActionMessage(ok);
      } catch (err) {
        if (err instanceof Error && err.message.startsWith("Replaced")) return;
        setActionMessage(err instanceof Error ? err.message : "Send failed.");
      }
    },
    [micSupported, ready, writeAcked],
  );

  const enable = useCallback(
    async (on: boolean) => {
      /* Push UI gain with enable — board defaults to 50% PGA otherwise,
       * which keeps speech levels visually tiny on a linear meter. */
      await run(
        encodeMicCmd(on ? { enable: true, gainPct } : { enable: false }),
        on ? "Mic enabled." : "Mic disabled.",
      );
      setEnabled(on);
      if (!on) {
        setStreaming(false);
        setLevel(null);
      }
    },
    [gainPct, run],
  );

  const setMute = useCallback(
    async (on: boolean) => {
      await run(encodeMicCmd({ mute: on }), on ? "Mic muted." : "Mic unmuted.");
      setMuted(on);
    },
    [run],
  );

  const setStream = useCallback(
    async (on: boolean) => {
      await run(
        encodeMicCmd({ stream: on, enable: true }),
        on ? "PCM stream on." : "PCM stream off.",
      );
      setEnabled(true);
      setStreaming(on);
    },
    [run],
  );

  const applyGain = useCallback(
    async (pct?: number) => {
      const g = pct ?? gainPct;
      setGainPct(g);
      await run(encodeMicCmd({ gainPct: g }), `Gain ${g}%.`);
    },
    [gainPct, run],
  );

  const micMessage =
    actionMessage ??
    (status !== "open"
      ? null
      : !micSupported
        ? "This workshop board target has no mic — switch to es3c28p."
        : !ready
          ? "Waiting for the board to settle…"
          : "Ready — enable the mic.");

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
    micSupported,
    enabled,
    muted,
    streaming,
    gainPct,
    level,
    waveform,
    micMessage,
    setGainPct,
    enable,
    setMute,
    setStream,
    applyGain,
    subscribePcm,
    subscribe,
    writeAcked,
  };
}
