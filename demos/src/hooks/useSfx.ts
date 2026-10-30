import { useCallback, useEffect, useRef, useState } from "react";

import { useAckedWrite } from "@/hooks/useAckedWrite";
import { useSerialSession, type SerialSessionState } from "@/hooks/useSerialSession";
import {
  MSG_SFX_CMD,
  MSG_SFX_PARAM,
  MSG_SFX_PROG,
  SFX_DEMO_MELODY,
  SFX_PRESET,
  encodeSfxParam,
  encodeSfxPlay,
  encodeSfxProg,
  encodeSfxStop,
  type SfxStep,
} from "@/lib/wire/sfx";

export type SfxState = Pick<
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
  volume: number;
  loops: number;
  lastPreset: number | null;
  sfxMessage: string | null;
  setVolume: (v: number) => void;
  setLoops: (n: number) => void;
  play: (preset: number) => Promise<void>;
  stop: () => Promise<void>;
  setMasterVolume: (pct: number) => Promise<void>;
  setEchoMix: (mix: number) => Promise<void>;
  setReleaseMs: (ms: number) => Promise<void>;
  uploadMelody: (steps?: SfxStep[]) => Promise<void>;
  playUser: () => Promise<void>;
};

/** Shared SFX session for ex06–ex10. */
export function useSfx(): SfxState {
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
  /* Desk-safe default — es3c28p speaker is loud at mid/high %. */
  const [volume, setVolume] = useState(15);
  const [loops, setLoops] = useState(0);
  const [lastPreset, setLastPreset] = useState<number | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const quietApplied = useRef(false);

  const connect = useCallback(async () => {
    quietApplied.current = false;
    setLastPreset(null);
    setActionMessage(null);
    await connectPort();
  }, [connectPort]);
  const connectSerial = useCallback(async () => {
    quietApplied.current = false;
    setLastPreset(null);
    setActionMessage(null);
    await connectSerialPort();
  }, [connectSerialPort]);

  const connectBle = useCallback(async () => {
    quietApplied.current = false;
    setLastPreset(null);
    setActionMessage(null);
    await connectBlePort();
  }, [connectBlePort]);


  const disconnect = useCallback(async () => {
    clearPending();
    quietApplied.current = false;
    setLastPreset(null);
    setActionMessage(null);
    await disconnectPort();
  }, [clearPending, disconnectPort]);

  /* Push a quiet master level once after settle so the first preset
   * is not at whatever volume the last session left on the codec. */
  useEffect(() => {
    if (!ready || quietApplied.current) return;
    quietApplied.current = true;
    void writeAcked(MSG_SFX_PARAM, encodeSfxParam(0xff, 0, 15)).catch(() => {
      /* ignore — play() still sends per-command volume */
    });
  }, [ready, writeAcked]);

  const run = useCallback(
    async (msgType: number, payload: Uint8Array, ok: string, preset?: number) => {
      if (!ready) {
        setActionMessage("Wait until the port has settled.");
        return;
      }
      try {
        const rc = await writeAcked(msgType, payload);
        if (rc !== 0) {
          setActionMessage(`Board rejected command (rc=${rc}).`);
          return;
        }
        if (preset !== undefined) setLastPreset(preset);
        setActionMessage(ok);
      } catch (err) {
        if (err instanceof Error && err.message.startsWith("Replaced")) return;
        setActionMessage(err instanceof Error ? err.message : "Send failed.");
      }
    },
    [ready, writeAcked],
  );

  const play = useCallback(
    async (preset: number) => {
      await run(
        MSG_SFX_CMD,
        encodeSfxPlay(preset, { volume, loops }),
        `Playing preset ${preset}.`,
        preset,
      );
    },
    [loops, run, volume],
  );

  const stop = useCallback(async () => {
    await run(MSG_SFX_CMD, encodeSfxStop(), "Stopped.", SFX_PRESET.STOP);
  }, [run]);

  const setMasterVolume = useCallback(
    async (pct: number) => {
      const v = Math.max(1, Math.min(100, Math.round(pct)));
      setVolume(v);
      await run(MSG_SFX_PARAM, encodeSfxParam(0xff, 0, v), `Master volume ${v}%.`);
    },
    [run],
  );

  const setEchoMix = useCallback(
    async (mix: number) => {
      const v = Math.max(0, Math.min(1, mix));
      await run(MSG_SFX_PARAM, encodeSfxParam(5, 1, v), `Echo mix ${v.toFixed(2)}.`);
    },
    [run],
  );

  const setReleaseMs = useCallback(
    async (ms: number) => {
      const v = Math.max(1, Math.min(2000, ms));
      await run(MSG_SFX_PARAM, encodeSfxParam(4, 3, v), `Release ${v} ms.`);
    },
    [run],
  );

  const uploadMelody = useCallback(
    async (steps: SfxStep[] = SFX_DEMO_MELODY) => {
      await run(MSG_SFX_PROG, encodeSfxProg(steps), "User melody uploaded.");
    },
    [run],
  );

  const playUser = useCallback(async () => {
    await play(SFX_PRESET.USER);
  }, [play]);

  const sfxMessage =
    actionMessage ??
    (status !== "open"
      ? null
      : !ready
        ? "Waiting for the board to settle…"
        : "Ready — pick a sound.");

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
    volume,
    loops,
    lastPreset,
    sfxMessage,
    setVolume,
    setLoops,
    play,
    stop,
    setMasterVolume,
    setEchoMix,
    setReleaseMs,
    uploadMelody,
    playUser,
  };
}
