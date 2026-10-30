import { useCallback, useEffect, useRef, useState } from "react";

import { useMic, type MicState } from "@/hooks/useMic";
import { MIC_FS_HZ } from "@/lib/pcm/PcmFftBridge";
import { downloadWav, playInt16Mono } from "@/lib/pcm/wav";

/** Soft cap — 30 s @ 16 kHz mono int16 ≈ 0.96 MB. */
export const REC_MAX_SAMPLES = MIC_FS_HZ * 30;

export type MicRecorderState = MicState & {
  recording: boolean;
  playing: boolean;
  /** Captured samples (empty until first Stop). */
  samples: Int16Array;
  durationSec: number;
  sampleRate: number;
  recMessage: string | null;
  startRecord: () => Promise<void>;
  stopRecord: () => void;
  play: () => Promise<void>;
  stopPlay: () => void;
  download: () => void;
  clear: () => void;
};

/**
 * Mic session + MicPcm capture → WAV download / Web Audio play (ex28).
 */
export function useMicRecorder(): MicRecorderState {
  const mic = useMic();
  const [recording, setRecording] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [samples, setSamples] = useState(() => new Int16Array(0));
  const [recMessage, setRecMessage] = useState<string | null>(null);

  const recordingRef = useRef(false);
  const chunksRef = useRef<Int16Array[]>([]);
  const countRef = useRef(0);
  const playCtxRef = useRef<AudioContext | null>(null);

  const stopPlay = useCallback(() => {
    const ctx = playCtxRef.current;
    playCtxRef.current = null;
    if (ctx) void ctx.close();
    setPlaying(false);
  }, []);

  const finalize = useCallback((msg: string | null = null) => {
    const total = countRef.current;
    const out = new Int16Array(total);
    let o = 0;
    for (const c of chunksRef.current) {
      out.set(c, o);
      o += c.length;
    }
    chunksRef.current = [];
    countRef.current = 0;
    setSamples(out);
    setRecMessage(
      msg ??
        (total > 0
          ? `Captured ${(total / MIC_FS_HZ).toFixed(2)} s (${total} samples).`
          : "No samples — is Stream PCM on?"),
    );
  }, []);

  useEffect(() => {
    return mic.subscribePcm((chunk) => {
      if (!recordingRef.current) return;
      const room = REC_MAX_SAMPLES - countRef.current;
      if (room <= 0) {
        recordingRef.current = false;
        setRecording(false);
        finalize("Hit 30 s cap — recording stopped.");
        return;
      }
      const take = chunk.length > room ? chunk.subarray(0, room) : chunk;
      chunksRef.current.push(Int16Array.from(take));
      countRef.current += take.length;
      if (countRef.current >= REC_MAX_SAMPLES) {
        recordingRef.current = false;
        setRecording(false);
        finalize("Hit 30 s cap — recording stopped.");
      }
    });
  }, [finalize, mic.subscribePcm]);

  const startRecord = useCallback(async () => {
    stopPlay();
    chunksRef.current = [];
    countRef.current = 0;
    setSamples(new Int16Array(0));
    setRecMessage("Recording…");
    recordingRef.current = true;
    setRecording(true);
    if (!mic.streaming) {
      await mic.setStream(true);
    }
  }, [mic, stopPlay]);

  const stopRecord = useCallback(() => {
    if (!recordingRef.current) return;
    recordingRef.current = false;
    setRecording(false);
    finalize();
  }, [finalize]);

  const play = useCallback(async () => {
    if (samples.length === 0) {
      setRecMessage("Nothing to play — record first.");
      return;
    }
    stopPlay();
    setPlaying(true);
    setRecMessage("Playing…");
    try {
      const ctx = await playInt16Mono(samples, MIC_FS_HZ);
      playCtxRef.current = ctx;
      const ms = (samples.length / MIC_FS_HZ) * 1000;
      window.setTimeout(() => {
        if (playCtxRef.current === ctx) {
          void ctx.close();
          playCtxRef.current = null;
          setPlaying(false);
          setRecMessage(`Played ${(samples.length / MIC_FS_HZ).toFixed(2)} s.`);
        }
      }, ms + 50);
    } catch (err) {
      setPlaying(false);
      setRecMessage(err instanceof Error ? err.message : "Play failed.");
    }
  }, [samples, stopPlay]);

  const download = useCallback(() => {
    if (samples.length === 0) {
      setRecMessage("Nothing to download — record first.");
      return;
    }
    const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    downloadWav(samples, `mic-${stamp}.wav`, MIC_FS_HZ);
    setRecMessage(`Downloaded mic-${stamp}.wav`);
  }, [samples]);

  const clear = useCallback(() => {
    stopPlay();
    recordingRef.current = false;
    setRecording(false);
    chunksRef.current = [];
    countRef.current = 0;
    setSamples(new Int16Array(0));
    setRecMessage("Cleared.");
  }, [stopPlay]);

  useEffect(() => {
    return () => {
      recordingRef.current = false;
      const ctx = playCtxRef.current;
      playCtxRef.current = null;
      if (ctx) void ctx.close();
    };
  }, []);

  const durationSec = samples.length / MIC_FS_HZ;

  return {
    ...mic,
    recording,
    playing,
    samples,
    durationSec,
    sampleRate: MIC_FS_HZ,
    recMessage,
    startRecord,
    stopRecord,
    play,
    stopPlay,
    download,
    clear,
  };
}
