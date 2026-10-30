import { useCallback, useEffect, useRef, useState } from "react";

import { useMic } from "@/hooks/useMic";
import {
  baselineClassify,
  KnnClassifier,
  SOUND_LABELS,
  toFeatureVec,
  type SoundLabel,
} from "@/lib/pcm/classify";
import { FeatureTap, type AudioFeatures } from "@/lib/pcm/features";
import { MIC_FS_HZ } from "@/lib/pcm/PcmFftBridge";
import { encodeLedOff, encodeLedSolid, MSG_LED_FX, type Rgb } from "@/lib/wire/led";
import { encodeSfxPlay, MSG_SFX_CMD, SFX_PRESET } from "@/lib/wire/sfx";
import { CAP, WORKSHOP_BOARD, boardHas } from "@/lib/workshop";

const STABLE_FRAMES = 4;
const SFX_COOLDOWN_MS = 1600;

const LED: Record<SoundLabel, Rgb | null> = {
  silence: null,
  speech: { r: 40, g: 100, b: 220 },
  whistle: { r: 20, g: 200, b: 120 },
  noise: { r: 220, g: 160, b: 20 },
};

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

export type MicReactState = ReturnType<typeof useMic> & {
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
  ledSupported: boolean;
  sfxSupported: boolean;
  reacting: boolean;
  lastAction: string | null;
  setReacting: (on: boolean) => void;
};

/**
 * MicPcm → classify (baseline / k-NN) → debounced LED + SFX (ex33).
 *
 * Mapping:
 * - silence → LED off
 * - speech → blue LED
 * - whistle → green LED + Chime (cooldown)
 * - noise → amber LED + rare Beep
 */
export function useMicReact(): MicReactState {
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
  const [reacting, setReacting] = useState(true);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const ledSupported = boardHas(CAP.LED);
  /* Speaker has no CAP bit — gate on board feature list. */
  const sfxSupported = WORKSHOP_BOARD.features.some((f) => f.id === "audio");

  const pendingRef = useRef<SoundLabel | null>(null);
  const stableRef = useRef(0);
  const actedRef = useRef<SoundLabel | null>(null);
  const lastSfxAt = useRef(0);
  const reactingRef = useRef(true);

  useEffect(() => {
    reactingRef.current = reacting;
  }, [reacting]);

  const writeAcked = mic.writeAcked;

  const fire = useCallback(
    async (lbl: SoundLabel) => {
      const parts: string[] = [];
      try {
        if (ledSupported) {
          const rgb = LED[lbl];
          if (rgb) {
            await writeAcked(MSG_LED_FX, encodeLedSolid(rgb));
            parts.push(`LED ${rgb.r},${rgb.g},${rgb.b}`);
          } else {
            await writeAcked(MSG_LED_FX, encodeLedOff());
            parts.push("LED off");
          }
        }
        if (sfxSupported) {
          const now = Date.now();
          if (lbl === "whistle" && now - lastSfxAt.current > SFX_COOLDOWN_MS) {
            lastSfxAt.current = now;
            await writeAcked(
              MSG_SFX_CMD,
              encodeSfxPlay(SFX_PRESET.CHIME, { volume: 12 }),
            );
            parts.push("Chime");
          } else if (
            lbl === "noise" &&
            now - lastSfxAt.current > SFX_COOLDOWN_MS * 2
          ) {
            lastSfxAt.current = now;
            await writeAcked(
              MSG_SFX_CMD,
              encodeSfxPlay(SFX_PRESET.BEEP, { volume: 8 }),
            );
            parts.push("Beep");
          }
        }
        setLastAction(
          parts.length ? `${lbl} → ${parts.join(" · ")}` : `${lbl} (no actuators)`,
        );
      } catch (err) {
        setLastAction(err instanceof Error ? err.message : "Actuator send failed.");
      }
    },
    [ledSupported, sfxSupported, writeAcked],
  );

  useEffect(() => {
    return mic.subscribePcm((chunk) => {
      const feat = tapRef.current?.pushInt16(chunk);
      if (!feat) return;
      setFeatures(feat);
      const vec = toFeatureVec(feat, MIC_FS_HZ);
      latestVecRef.current = vec;

      let nextLabel: SoundLabel;
      const knn = knnRef.current.predict(vec);
      if (knn) {
        setMode("knn");
        setScores(knn.scores);
        nextLabel = knn.label;
      } else {
        const base = baselineClassify(feat);
        setMode("baseline");
        setScores(base.scores);
        nextLabel = base.label;
      }
      setLabel(nextLabel);

      if (!reactingRef.current) return;
      if (pendingRef.current === nextLabel) stableRef.current += 1;
      else {
        pendingRef.current = nextLabel;
        stableRef.current = 1;
      }
      if (stableRef.current >= STABLE_FRAMES && actedRef.current !== nextLabel) {
        actedRef.current = nextLabel;
        void fire(nextLabel);
      }
    });
  }, [fire, mic.subscribePcm]);

  useEffect(() => {
    if (!mic.streaming) {
      tapRef.current?.reset();
      tapRef.current = null;
      setClassifyReady(false);
      setFeatures(EMPTY_FEATURES);
      setLabel("silence");
      setScores(EMPTY_SCORES);
      pendingRef.current = null;
      stableRef.current = 0;
      actedRef.current = null;
      return;
    }
    tapRef.current = new FeatureTap(256, MIC_FS_HZ);
    setClassifyReady(true);
    setClassifyMessage("Classify → board reactions when React is on.");
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
    setClassifyMessage("Training cleared — baseline rules.");
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
    ledSupported,
    sfxSupported,
    reacting,
    lastAction,
    setReacting,
  };
}
