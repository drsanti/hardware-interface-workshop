import { useCallback, useEffect, useRef, useState } from "react";

import { useMic, type MicState } from "@/hooks/useMic";
import {
  baselineClassify,
  KnnClassifier,
  SOUND_LABELS,
  toFeatureVec,
  type SoundLabel,
} from "@/lib/pcm/classify";
import { FeatureTap, type AudioFeatures } from "@/lib/pcm/features";
import { MIC_FS_HZ } from "@/lib/pcm/PcmFftBridge";

const EMPTY_FEATURES: AudioFeatures = {
  rms: 0,
  zcr: 0,
  centroidHz: 0,
  flatness: 0,
  rolloffHz: 0,
};

const EMPTY_SCORES: Record<SoundLabel, number> = {
  silence: 0,
  speech: 0,
  whistle: 0,
  noise: 0,
};

export type MicClassifyState = MicState & {
  features: AudioFeatures;
  label: SoundLabel;
  scores: Record<SoundLabel, number>;
  mode: "baseline" | "knn";
  counts: Record<SoundLabel, number>;
  sampleRate: number;
  classifyReady: boolean;
  classifyMessage: string | null;
  mark: (label: SoundLabel) => void;
  clearTraining: () => void;
};

/** MicPcm → features → baseline or k-NN class (ex32). */
export function useMicClassify(): MicClassifyState {
  const mic = useMic();
  const tapRef = useRef<FeatureTap | null>(null);
  const knnRef = useRef(new KnnClassifier(3));
  const latestVecRef = useRef(toFeatureVec(EMPTY_FEATURES));

  const [features, setFeatures] = useState<AudioFeatures>(EMPTY_FEATURES);
  const [label, setLabel] = useState<SoundLabel>("silence");
  const [scores, setScores] = useState(EMPTY_SCORES);
  const [mode, setMode] = useState<"baseline" | "knn">("baseline");
  const [counts, setCounts] = useState(() => knnRef.current.countByLabel());
  const [classifyReady, setClassifyReady] = useState(false);
  const [classifyMessage, setClassifyMessage] = useState<string | null>(null);

  useEffect(() => {
    return mic.subscribePcm((chunk) => {
      const feat = tapRef.current?.pushInt16(chunk);
      if (!feat) return;
      setFeatures(feat);
      const vec = toFeatureVec(feat, MIC_FS_HZ);
      latestVecRef.current = vec;

      const knn = knnRef.current.predict(vec);
      if (knn) {
        setMode("knn");
        setLabel(knn.label);
        setScores(knn.scores);
      } else {
        const base = baselineClassify(feat);
        setMode("baseline");
        setLabel(base.label);
        setScores(base.scores);
      }
    });
  }, [mic.subscribePcm]);

  useEffect(() => {
    if (!mic.streaming) {
      tapRef.current?.reset();
      tapRef.current = null;
      setClassifyReady(false);
      setFeatures(EMPTY_FEATURES);
      setLabel("silence");
      setScores(EMPTY_SCORES);
      return;
    }
    tapRef.current = new FeatureTap(256, MIC_FS_HZ);
    setClassifyReady(true);
    setClassifyMessage("Baseline rules active — mark examples to train k-NN.");
    return () => {
      tapRef.current?.reset();
      tapRef.current = null;
      setClassifyReady(false);
    };
  }, [mic.streaming]);

  const mark = useCallback((lbl: SoundLabel) => {
    knnRef.current.add(lbl, latestVecRef.current);
    const next = knnRef.current.countByLabel();
    setCounts({ ...next });
    const total = SOUND_LABELS.reduce((s, k) => s + next[k], 0);
    setClassifyMessage(
      total < 3
        ? `Saved ${lbl} (${total}/3 min for k-NN).`
        : `Saved ${lbl} · ${total} exemplars · k-NN live.`,
    );
  }, []);

  const clearTraining = useCallback(() => {
    knnRef.current.clear();
    setCounts(knnRef.current.countByLabel());
    setMode("baseline");
    setClassifyMessage("Training cleared — back to baseline rules.");
  }, []);

  return {
    ...mic,
    features,
    label,
    scores,
    mode,
    counts,
    sampleRate: MIC_FS_HZ,
    classifyReady,
    classifyMessage,
    mark,
    clearTraining,
  };
}
