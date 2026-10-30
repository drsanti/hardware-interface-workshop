import { useEffect, useRef, useState } from "react";

import { useMic, type MicState } from "@/hooks/useMic";
import { MIC_FS_HZ, PcmFftBridge } from "@/lib/pcm/PcmFftBridge";

export type MicSpectrogramState = MicState & {
  /** Latest hop column (byte bins); null until first column. */
  column: Uint8Array | null;
  /** Monotonic counter — bumps when `column` is new (canvas redraw). */
  columnSeq: number;
  binCount: number;
  sampleRate: number;
  fftReady: boolean;
};

/**
 * Mic session + MicPcm → hopped FFT columns for a scrolling spectrogram (ex27).
 */
export function useMicSpectrogram(): MicSpectrogramState {
  const mic = useMic();
  const bridgeRef = useRef<PcmFftBridge | null>(null);
  const [column, setColumn] = useState<Uint8Array | null>(null);
  const [columnSeq, setColumnSeq] = useState(0);
  const [binCount, setBinCount] = useState(256);
  const [sampleRate, setSampleRate] = useState(MIC_FS_HZ);
  const [fftReady, setFftReady] = useState(false);

  useEffect(() => {
    return mic.subscribePcm((samples) => {
      bridgeRef.current?.pushInt16(samples);
    });
  }, [mic.subscribePcm]);

  useEffect(() => {
    if (!mic.streaming) {
      bridgeRef.current?.stop();
      setFftReady(false);
      setColumn(null);
      return;
    }

    const bridge = new PcmFftBridge();
    bridgeRef.current = bridge;
    let raf = 0;
    let alive = true;

    void bridge.start().then(() => {
      if (!alive) {
        bridge.dispose();
        return;
      }
      setSampleRate(bridge.sampleRate);
      setBinCount(bridge.frequencyBinCount);
      setFftReady(true);

      const tick = () => {
        if (!alive) return;
        /* Drain all ready hops this frame (USB can deliver >1 chunk). */
        let last: Uint8Array | null = null;
        for (;;) {
          const col = bridge.takeColumn();
          if (!col) break;
          last = col;
        }
        if (last) {
          setColumn(last);
          setColumnSeq((n) => n + 1);
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      bridge.dispose();
      if (bridgeRef.current === bridge) bridgeRef.current = null;
      setFftReady(false);
    };
  }, [mic.streaming]);

  return {
    ...mic,
    column,
    columnSeq,
    binCount,
    sampleRate,
    fftReady,
  };
}
