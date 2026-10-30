import type { AudioFeatures } from "@/lib/pcm/features";
import { MIC_FS_HZ } from "@/lib/pcm/PcmFftBridge";

export type SoundLabel = "silence" | "speech" | "whistle" | "noise";

export const SOUND_LABELS: SoundLabel[] = ["silence", "speech", "whistle", "noise"];

export type FeatureVec = Float32Array; /* length 5, normalized ~0..1 */

/** Pack features into a comparable vector (scales for k-NN). */
export function toFeatureVec(f: AudioFeatures, sampleRate = MIC_FS_HZ): FeatureVec {
  const nyq = sampleRate / 2;
  return new Float32Array([
    Math.min(1, f.rms * 4),
    Math.min(1, f.zcr * 5),
    Math.min(1, f.centroidHz / nyq),
    Math.min(1, f.flatness),
    Math.min(1, f.rolloffHz / nyq),
  ]);
}

function dist(a: FeatureVec, b: FeatureVec): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) {
    const d = (a[i] ?? 0) - (b[i] ?? 0);
    s += d * d;
  }
  return Math.sqrt(s);
}

/**
 * Hand-tuned baseline so the lab works before any training.
 * Students can beat it by adding labeled k-NN exemplars.
 */
export function baselineClassify(f: AudioFeatures): {
  label: SoundLabel;
  scores: Record<SoundLabel, number>;
} {
  const scores: Record<SoundLabel, number> = {
    silence: 0,
    speech: 0,
    whistle: 0,
    noise: 0,
  };

  if (f.rms < 0.018) {
    scores.silence = 0.95;
  } else if (f.centroidHz > 1800 && f.flatness < 0.35 && f.zcr < 0.22) {
    scores.whistle = 0.7 + Math.min(0.25, (f.centroidHz - 1800) / 4000);
    scores.speech = 0.15;
    scores.noise = 0.1;
  } else if (f.rms > 0.03 && f.zcr > 0.04 && f.zcr < 0.28 && f.flatness < 0.55) {
    scores.speech = 0.65;
    scores.noise = 0.2;
    scores.whistle = f.centroidHz > 1200 ? 0.15 : 0.05;
  } else {
    scores.noise = 0.55;
    scores.speech = 0.25;
    scores.whistle = 0.1;
    scores.silence = f.rms < 0.03 ? 0.2 : 0.05;
  }

  let best: SoundLabel = "silence";
  let bestV = -1;
  for (const k of SOUND_LABELS) {
    if (scores[k] > bestV) {
      bestV = scores[k];
      best = k;
    }
  }
  return { label: best, scores };
}

export type Exemplar = { label: SoundLabel; vec: FeatureVec };

/** Majority-vote k-NN over student-labeled exemplars. */
export class KnnClassifier {
  readonly exemplars: Exemplar[] = [];
  k: number;

  constructor(k = 3) {
    this.k = k;
  }

  add(label: SoundLabel, vec: FeatureVec): void {
    this.exemplars.push({ label, vec: Float32Array.from(vec) });
  }

  clear(): void {
    this.exemplars.length = 0;
  }

  countByLabel(): Record<SoundLabel, number> {
    const out: Record<SoundLabel, number> = {
      silence: 0,
      speech: 0,
      whistle: 0,
      noise: 0,
    };
    for (const e of this.exemplars) out[e.label] += 1;
    return out;
  }

  /**
   * Predict with k-NN when enough exemplars exist; else `null`
   * (caller falls back to baseline).
   */
  predict(vec: FeatureVec): {
    label: SoundLabel;
    scores: Record<SoundLabel, number>;
  } | null {
    if (this.exemplars.length < this.k) return null;

    const scored = this.exemplars
      .map((e) => ({ label: e.label, d: dist(vec, e.vec) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, this.k);

    const votes: Record<SoundLabel, number> = {
      silence: 0,
      speech: 0,
      whistle: 0,
      noise: 0,
    };
    for (const s of scored) {
      /* Closer neighbors weigh more. */
      votes[s.label] += 1 / (0.05 + s.d);
    }
    let sum = 0;
    for (const k of SOUND_LABELS) sum += votes[k];
    const scores: Record<SoundLabel, number> = {
      silence: 0,
      speech: 0,
      whistle: 0,
      noise: 0,
    };
    let best: SoundLabel = "silence";
    let bestV = -1;
    for (const k of SOUND_LABELS) {
      scores[k] = sum > 0 ? votes[k] / sum : 0;
      if (scores[k] > bestV) {
        bestV = scores[k];
        best = k;
      }
    }
    return { label: best, scores };
  }
}
