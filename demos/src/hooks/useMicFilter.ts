import { useCallback, useEffect, useRef, useState } from "react";

import { useMic, type MicState } from "@/hooks/useMic";
import { Biquad, type BiquadKind } from "@/lib/pcm/biquad";
import { MIC_FS_HZ, PcmFftBridge } from "@/lib/pcm/PcmFftBridge";
import { PcmPlaybackBridge } from "@/lib/pcm/PcmPlaybackBridge";

export type MicFilterState = MicState & {
  filterKind: BiquadKind;
  cutoffHz: number;
  q: number;
  monitor: boolean;
  volume: number;
  spectrum: Uint8Array;
  peakHz: number;
  sampleRate: number;
  fftReady: boolean;
  filterMessage: string | null;
  setFilterKind: (k: BiquadKind) => void;
  setCutoffHz: (hz: number) => void;
  setQ: (q: number) => void;
  setMonitor: (on: boolean) => void;
  setVolume: (v: number) => void;
};

/**
 * Live MicPcm → biquad → optional speaker monitor + FFT of wet signal (ex29).
 */
export function useMicFilter(): MicFilterState {
  const mic = useMic();
  const [filterKind, setFilterKindState] = useState<BiquadKind>("lowpass");
  const [cutoffHz, setCutoffHzState] = useState(1200);
  const [q, setQState] = useState(0.707);
  const [monitor, setMonitorState] = useState(false);
  const [volume, setVolumeState] = useState(0.7);
  const [spectrum, setSpectrum] = useState(() => new Uint8Array(256));
  const [peakHz, setPeakHz] = useState(0);
  const [sampleRate] = useState(MIC_FS_HZ);
  const [fftReady, setFftReady] = useState(false);
  const [filterMessage, setFilterMessage] = useState<string | null>(null);

  const biquadRef = useRef(new Biquad(MIC_FS_HZ));
  const fftRef = useRef<PcmFftBridge | null>(null);
  const playRef = useRef<PcmPlaybackBridge | null>(null);
  const monitorRef = useRef(false);
  const floatScratchRef = useRef(new Float32Array(512));
  const intScratchRef = useRef(new Int16Array(512));

  useEffect(() => {
    biquadRef.current.configure(filterKind, cutoffHz, q);
  }, [cutoffHz, filterKind, q]);

  useEffect(() => {
    monitorRef.current = monitor;
  }, [monitor]);

  useEffect(() => {
    return mic.subscribePcm((chunk) => {
      const need = chunk.length;
      if (floatScratchRef.current.length < need) {
        floatScratchRef.current = new Float32Array(need);
        intScratchRef.current = new Int16Array(need);
      }
      const wet = biquadRef.current.processInt16(chunk, floatScratchRef.current);
      const asInt = intScratchRef.current;
      for (let i = 0; i < wet.length; i++) {
        asInt[i] = Math.max(-32768, Math.min(32767, Math.round((wet[i] ?? 0) * 32767)));
      }
      fftRef.current?.pushInt16(asInt.subarray(0, wet.length));
      if (monitorRef.current) playRef.current?.pushFloat(wet);
    });
  }, [mic.subscribePcm]);

  useEffect(() => {
    if (!mic.streaming) {
      fftRef.current?.stop();
      playRef.current?.stop();
      setFftReady(false);
      setSpectrum((prev) => new Uint8Array(prev.length));
      setPeakHz(0);
      return;
    }

    const fft = new PcmFftBridge();
    fftRef.current = fft;
    let raf = 0;
    let alive = true;

    void fft.start().then(() => {
      if (!alive) {
        fft.dispose();
        return;
      }
      setFftReady(true);
      const tick = () => {
        if (!alive) return;
        const bins = fft.getByteFrequencyData();
        setSpectrum(Uint8Array.from(bins));
        let bestI = 0;
        let bestV = 0;
        for (let i = 2; i < bins.length; i++) {
          const v = bins[i] ?? 0;
          if (v > bestV) {
            bestV = v;
            bestI = i;
          }
        }
        setPeakHz(bestV > 12 ? fft.binHz(bestI) : 0);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      fft.dispose();
      if (fftRef.current === fft) fftRef.current = null;
      setFftReady(false);
    };
  }, [mic.streaming]);

  const setFilterKind = useCallback((k: BiquadKind) => {
    setFilterKindState(k);
    biquadRef.current.reset();
    setFilterMessage(k === "bypass" ? "Bypass — dry MicPcm." : `${k} engaged.`);
  }, []);

  const setCutoffHz = useCallback((hz: number) => {
    setCutoffHzState(hz);
  }, []);

  const setQ = useCallback((next: number) => {
    setQState(next);
  }, []);

  const setMonitor = useCallback(
    async (on: boolean) => {
      setMonitorState(on);
      if (on) {
        if (!playRef.current) playRef.current = new PcmPlaybackBridge();
        playRef.current.setVolume(volume);
        try {
          await playRef.current.start();
          if (!mic.streaming) await mic.setStream(true);
          setFilterMessage("Monitor on — filtered audio to PC speakers.");
        } catch (err) {
          setMonitorState(false);
          setFilterMessage(err instanceof Error ? err.message : "Monitor failed.");
        }
      } else {
        playRef.current?.stop();
        setFilterMessage("Monitor off.");
      }
    },
    [mic, volume],
  );

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    playRef.current?.setVolume(v);
  }, []);

  useEffect(() => {
    return () => {
      playRef.current?.dispose();
      playRef.current = null;
    };
  }, []);

  return {
    ...mic,
    filterKind,
    cutoffHz,
    q,
    monitor,
    volume,
    spectrum,
    peakHz,
    sampleRate,
    fftReady,
    filterMessage,
    setFilterKind,
    setCutoffHz,
    setQ,
    setMonitor,
    setVolume,
  };
}
