import { useEffect, useRef, useState } from "react";

import { useMic, type MicState } from "@/hooks/useMic";
import { MIC_FS_HZ } from "@/lib/pcm/PcmFftBridge";
import { PitchTap, type PitchResult } from "@/lib/pcm/yin";

const HISTORY = 100;

const EMPTY: PitchResult = {
  hz: null,
  confidence: 0,
  midi: null,
  note: null,
  cents: null,
  rms: 0,
};

export type MicPitchState = MicState & {
  pitch: PitchResult;
  /** Recent Hz values (0 when unvoiced) for a sparkline. */
  hzHistory: Float32Array;
  sampleRate: number;
  pitchReady: boolean;
};

/** Mic session + MicPcm → YIN pitch (ex31). */
export function useMicPitch(): MicPitchState {
  const mic = useMic();
  const tapRef = useRef<PitchTap | null>(null);
  const [pitch, setPitch] = useState<PitchResult>(EMPTY);
  const [hzHistory, setHzHistory] = useState(() => new Float32Array(HISTORY));
  const [pitchReady, setPitchReady] = useState(false);
  const histRef = useRef(new Float32Array(HISTORY));

  useEffect(() => {
    return mic.subscribePcm((chunk) => {
      const next = tapRef.current?.pushInt16(chunk);
      if (!next) return;
      setPitch(next);
      const h = histRef.current;
      h.copyWithin(0, 1);
      h[h.length - 1] = next.hz && next.confidence > 0.4 ? next.hz : 0;
      setHzHistory(Float32Array.from(h));
    });
  }, [mic.subscribePcm]);

  useEffect(() => {
    if (!mic.streaming) {
      tapRef.current?.reset();
      tapRef.current = null;
      setPitchReady(false);
      setPitch(EMPTY);
      histRef.current.fill(0);
      setHzHistory(new Float32Array(HISTORY));
      return;
    }
    tapRef.current = new PitchTap(MIC_FS_HZ);
    setPitchReady(true);
    return () => {
      tapRef.current?.reset();
      tapRef.current = null;
      setPitchReady(false);
    };
  }, [mic.streaming]);

  return {
    ...mic,
    pitch,
    hzHistory,
    sampleRate: MIC_FS_HZ,
    pitchReady,
  };
}
