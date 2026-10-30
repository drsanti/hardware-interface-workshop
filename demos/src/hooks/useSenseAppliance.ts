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
import {
  MSG_BATTERY,
  decodeBatteryStatus,
  type BatteryStatusView,
} from "@/lib/wire/battery";
import {
  KEY_EV,
  MSG_KEY_EVENT,
  decodeKeyEvent,
  keyLabel,
  type KeyEventView,
} from "@/lib/wire/key";
import { encodeLedOff, encodeLedSolid, MSG_LED_FX, type Rgb } from "@/lib/wire/led";
import {
  encodeSfxPlay,
  encodeSfxStop,
  MSG_SFX_CMD,
  SFX_PRESET,
} from "@/lib/wire/sfx";
import { CAP, WORKSHOP_BOARD, boardHas } from "@/lib/workshop";

const STABLE_FRAMES = 4;
const SFX_COOLDOWN_MS = 1600;
const BATT_WARN_BELOW = 25;

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

export type SenseApplianceState = ReturnType<typeof useMic> & {
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
  btnSupported: boolean;
  battSupported: boolean;
  reacting: boolean;
  setReacting: (on: boolean) => void;
  lastAction: string | null;
  lastKey: KeyEventView | null;
  keyEvents: KeyEventView[];
  keyHint: string | null;
  clearKeys: () => void;
  battery: BatteryStatusView | null;
  battUpdatedAt: number | null;
  battLow: boolean;
  battWarnBelow: number;
};

/**
 * Capstone appliance (ex34): MicPcm classify → LED/SFX, gated by button + battery.
 *
 * Keys (BOOT):
 * - SHORT → toggle React
 * - DOUBLE → Chime (ack)
 * - LONG → Stop + LED off + React off
 *
 * Battery ≤ 25% suppresses SFX (desk-safe / low-power).
 */
export function useSenseAppliance(): SenseApplianceState {
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
  const [lastKey, setLastKey] = useState<KeyEventView | null>(null);
  const [keyEvents, setKeyEvents] = useState<KeyEventView[]>([]);
  const [keyHint, setKeyHint] = useState<string | null>(null);
  const [battery, setBattery] = useState<BatteryStatusView | null>(null);
  const [battUpdatedAt, setBattUpdatedAt] = useState<number | null>(null);

  const ledSupported = boardHas(CAP.LED);
  const btnSupported = boardHas(CAP.BTN);
  const battSupported = boardHas(CAP.BATT);
  const sfxSupported = WORKSHOP_BOARD.features.some((f) => f.id === "audio");
  const battLow = battery != null && battery.pct <= BATT_WARN_BELOW;

  const pendingRef = useRef<SoundLabel | null>(null);
  const stableRef = useRef(0);
  const actedRef = useRef<SoundLabel | null>(null);
  const lastSfxAt = useRef(0);
  const reactingRef = useRef(true);
  const battLowRef = useRef(false);
  const writeAcked = mic.writeAcked;

  useEffect(() => {
    reactingRef.current = reacting;
  }, [reacting]);

  useEffect(() => {
    battLowRef.current = battLow;
  }, [battLow]);

  const fireClass = useCallback(
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
        if (sfxSupported && !battLowRef.current) {
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
        } else if (sfxSupported && battLowRef.current) {
          parts.push("SFX muted (low batt)");
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
        void fireClass(nextLabel);
      }
    });
  }, [fireClass, mic.subscribePcm]);

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
    setClassifyMessage("Classify → board when React is on.");
    return () => {
      tapRef.current?.reset();
      tapRef.current = null;
      setClassifyReady(false);
    };
  }, [mic.streaming]);

  useEffect(() => {
    if (!mic.ready) return;
    return mic.subscribe((frame) => {
      if (frame.msgType === MSG_BATTERY) {
        setBattery(decodeBatteryStatus(frame.payload));
        setBattUpdatedAt(Date.now());
        return;
      }
      if (frame.msgType !== MSG_KEY_EVENT) return;
      const ev = decodeKeyEvent(frame.payload);
      setLastKey(ev);
      setKeyEvents((prev) => [ev, ...prev].slice(0, 10));

      void (async () => {
        try {
          if (ev.event === KEY_EV.SHORT) {
            const next = !reactingRef.current;
            reactingRef.current = next;
            setReacting(next);
            actedRef.current = null;
            setKeyHint(
              `${keyLabel(ev.key)} SHORT → React ${next ? "on" : "off"}`,
            );
          } else if (ev.event === KEY_EV.DOUBLE) {
            if (battLowRef.current) {
              setKeyHint(`${keyLabel(ev.key)} DOUBLE → Chime blocked (low batt)`);
              return;
            }
            await writeAcked(
              MSG_SFX_CMD,
              encodeSfxPlay(SFX_PRESET.CHIME, { volume: 10 }),
            );
            setKeyHint(`${keyLabel(ev.key)} DOUBLE → Chime`);
          } else if (ev.event === KEY_EV.LONG) {
            reactingRef.current = false;
            setReacting(false);
            actedRef.current = null;
            await writeAcked(MSG_SFX_CMD, encodeSfxStop());
            if (ledSupported) await writeAcked(MSG_LED_FX, encodeLedOff());
            setKeyHint(`${keyLabel(ev.key)} LONG → Stop + React off`);
            setLastAction("Emergency stop");
          }
        } catch {
          /* ignore */
        }
      })();
    });
  }, [ledSupported, mic.ready, mic.subscribe, writeAcked]);

  useEffect(() => {
    if (mic.status !== "open") {
      setBattery(null);
      setBattUpdatedAt(null);
      setLastKey(null);
      setKeyEvents([]);
      setKeyHint(null);
    }
  }, [mic.status]);

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

  const clearKeys = useCallback(() => {
    setLastKey(null);
    setKeyEvents([]);
    setKeyHint(null);
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
    btnSupported,
    battSupported,
    reacting,
    setReacting,
    lastAction,
    lastKey,
    keyEvents,
    keyHint,
    clearKeys,
    battery,
    battUpdatedAt,
    battLow,
    battWarnBelow: BATT_WARN_BELOW,
  };
}
