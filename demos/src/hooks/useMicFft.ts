import { useEffect, useRef, useState } from "react";

import { useMic, type MicState } from "@/hooks/useMic";
import { MIC_FS_HZ, PcmFftBridge } from "@/lib/pcm/PcmFftBridge";

export type MicFftState = MicState & {
  /** Live byte-frequency bins (0..255) from AnalyserNode. */
  spectrum: Uint8Array;
  /** Hz of the strongest bin (rough pitch hint). */
  peakHz: number;
  sampleRate: number;
  fftReady: boolean;
};

/**
 * Mic session + MicPcm → in-process FFT (ex26).
 * No Web Audio — board PCM alone drives the spectrum.
 */
export function useMicFft(): MicFftState {
  const mic = useMic();
  const bridgeRef = useRef<PcmFftBridge | null>(null);
  const [spectrum, setSpectrum] = useState(() => new Uint8Array(256));
  const [peakHz, setPeakHz] = useState(0);
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
      setSpectrum((prev) => new Uint8Array(prev.length));
      setPeakHz(0);
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
      setFftReady(true);

      const tick = () => {
        if (!alive) return;
        const bins = bridge.getByteFrequencyData();
        setSpectrum(Uint8Array.from(bins));
        let bestI = 0;
        let bestV = 0;
        /* Skip DC — speech energy lives above a few hundred Hz. */
        for (let i = 2; i < bins.length; i++) {
          const v = bins[i] ?? 0;
          if (v > bestV) {
            bestV = v;
            bestI = i;
          }
        }
        setPeakHz(bestV > 12 ? bridge.binHz(bestI) : 0);
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
    spectrum,
    peakHz,
    sampleRate,
    fftReady,
  };
}
