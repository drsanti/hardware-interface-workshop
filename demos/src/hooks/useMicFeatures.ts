import { useEffect, useRef, useState } from "react";

import { useMic, type MicState } from "@/hooks/useMic";
import { FeatureTap, type AudioFeatures } from "@/lib/pcm/features";
import { MIC_FS_HZ } from "@/lib/pcm/PcmFftBridge";

const HISTORY = 80;

const EMPTY: AudioFeatures = {
  rms: 0,
  zcr: 0,
  centroidHz: 0,
  flatness: 0,
  rolloffHz: 0,
};

export type MicFeaturesState = MicState & {
  features: AudioFeatures;
  /** Rolling centroid Hz history for a sparkline. */
  centroidHistory: Float32Array;
  /** Rolling RMS history (0..1). */
  rmsHistory: Float32Array;
  sampleRate: number;
  featuresReady: boolean;
};

/**
 * Mic session + MicPcm → live MIR features (ex30).
 */
export function useMicFeatures(): MicFeaturesState {
  const mic = useMic();
  const tapRef = useRef<FeatureTap | null>(null);
  const [features, setFeatures] = useState<AudioFeatures>(EMPTY);
  const [centroidHistory, setCentroidHistory] = useState(
    () => new Float32Array(HISTORY),
  );
  const [rmsHistory, setRmsHistory] = useState(() => new Float32Array(HISTORY));
  const [featuresReady, setFeaturesReady] = useState(false);
  const centRef = useRef(new Float32Array(HISTORY));
  const rmsRef = useRef(new Float32Array(HISTORY));

  useEffect(() => {
    return mic.subscribePcm((chunk) => {
      const feat = tapRef.current?.pushInt16(chunk);
      if (!feat) return;
      setFeatures(feat);

      const c = centRef.current;
      c.copyWithin(0, 1);
      c[c.length - 1] = feat.centroidHz;
      setCentroidHistory(Float32Array.from(c));

      const r = rmsRef.current;
      r.copyWithin(0, 1);
      r[r.length - 1] = feat.rms;
      setRmsHistory(Float32Array.from(r));
    });
  }, [mic.subscribePcm]);

  useEffect(() => {
    if (!mic.streaming) {
      tapRef.current?.reset();
      tapRef.current = null;
      setFeaturesReady(false);
      setFeatures(EMPTY);
      centRef.current.fill(0);
      rmsRef.current.fill(0);
      setCentroidHistory(new Float32Array(HISTORY));
      setRmsHistory(new Float32Array(HISTORY));
      return;
    }
    tapRef.current = new FeatureTap(256, MIC_FS_HZ);
    setFeaturesReady(true);
    return () => {
      tapRef.current?.reset();
      tapRef.current = null;
      setFeaturesReady(false);
    };
  }, [mic.streaming]);

  return {
    ...mic,
    features,
    centroidHistory,
    rmsHistory,
    sampleRate: MIC_FS_HZ,
    featuresReady,
  };
}
