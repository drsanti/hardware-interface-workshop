import { MIC_FS_HZ } from "@/lib/pcm/PcmFftBridge";

export type PitchResult = {
  /** Fundamental frequency in Hz, or null if unvoiced / quiet. */
  hz: number | null;
  /** 0..1 confidence (1 − yin threshold at the pick). */
  confidence: number;
  /** MIDI note number when pitched. */
  midi: number | null;
  /** Note name like `A4`, or null. */
  note: string | null;
  /** Cents offset from equal-tempered note (−50..+50). */
  cents: number | null;
  rms: number;
};

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;

export function hzToNote(hz: number): { midi: number; note: string; cents: number } {
  const midiFloat = 69 + 12 * Math.log2(hz / 440);
  const midi = Math.round(midiFloat);
  const cents = (midiFloat - midi) * 100;
  const name = NOTE_NAMES[((midi % 12) + 12) % 12]!;
  const octave = Math.floor(midi / 12) - 1;
  return { midi, note: `${name}${octave}`, cents };
}

/**
 * YIN pitch estimate (de Cheveigné & Kawahara).
 * `samples` = mono float (−1..1); needs length ≥ 2 × τ_max.
 */
export function yinPitch(
  samples: Float32Array,
  sampleRate: number = MIC_FS_HZ,
  threshold = 0.12,
  fMin = 70,
  fMax = 900,
): PitchResult {
  let sumSq = 0;
  for (let i = 0; i < samples.length; i++) sumSq += (samples[i] ?? 0) ** 2;
  const rms = Math.sqrt(sumSq / samples.length);
  if (rms < 0.01) {
    return { hz: null, confidence: 0, midi: null, note: null, cents: null, rms };
  }

  const tauMin = Math.max(2, Math.floor(sampleRate / fMax));
  const tauMax = Math.min(
    Math.floor(sampleRate / fMin),
    Math.floor(samples.length / 2) - 2,
  );
  if (tauMax <= tauMin + 2) {
    return { hz: null, confidence: 0, midi: null, note: null, cents: null, rms };
  }

  const yin = new Float32Array(tauMax + 1);
  /* Difference function */
  for (let tau = 1; tau <= tauMax; tau++) {
    let sum = 0;
    const n = samples.length - tau;
    for (let i = 0; i < n; i++) {
      const d = (samples[i] ?? 0) - (samples[i + tau] ?? 0);
      sum += d * d;
    }
    yin[tau] = sum;
  }

  /* Cumulative mean normalized difference */
  yin[0] = 1;
  let running = 0;
  for (let tau = 1; tau <= tauMax; tau++) {
    running += yin[tau] ?? 0;
    yin[tau] = running > 0 ? ((yin[tau] ?? 0) * tau) / running : 1;
  }

  /* Absolute threshold */
  let tauEst = -1;
  for (let tau = tauMin; tau < tauMax; tau++) {
    if ((yin[tau] ?? 1) < threshold) {
      while (tau + 1 < tauMax && (yin[tau + 1] ?? 1) < (yin[tau] ?? 1)) tau += 1;
      tauEst = tau;
      break;
    }
  }
  if (tauEst < 0) {
    /* Fallback: global min in range */
    let best = tauMin;
    for (let tau = tauMin + 1; tau <= tauMax; tau++) {
      if ((yin[tau] ?? 1) < (yin[best] ?? 1)) best = tau;
    }
    if ((yin[best] ?? 1) < 0.4) tauEst = best;
  }
  if (tauEst < 0) {
    return { hz: null, confidence: 0, midi: null, note: null, cents: null, rms };
  }

  /* Parabolic interpolation */
  const x0 = tauEst > 0 ? (yin[tauEst - 1] ?? 0) : (yin[tauEst] ?? 0);
  const x1 = yin[tauEst] ?? 0;
  const x2 = tauEst + 1 <= tauMax ? (yin[tauEst + 1] ?? 0) : x1;
  const denom = 2 * (x0 - 2 * x1 + x2);
  const better = Math.abs(denom) > 1e-12 ? tauEst + (x0 - x2) / denom : tauEst;
  const hz = sampleRate / better;
  if (hz < fMin || hz > fMax) {
    return { hz: null, confidence: 0, midi: null, note: null, cents: null, rms };
  }

  const confidence = Math.max(0, Math.min(1, 1 - (yin[tauEst] ?? 1)));
  const mapped = hzToNote(hz);
  return {
    hz,
    confidence,
    midi: mapped.midi,
    note: mapped.note,
    cents: mapped.cents,
    rms,
  };
}

const BUF = 2048;
const HOP = 512;

/** Ring buffer that runs YIN every hop. */
export class PitchTap {
  private ring = new Float32Array(BUF);
  private write = 0;
  private filled = 0;
  private since = 0;
  private readonly fs: number;
  private readonly hop: number;

  constructor(sampleRate: number = MIC_FS_HZ, hop = HOP) {
    this.fs = sampleRate;
    this.hop = hop;
  }

  pushInt16(samples: Int16Array): PitchResult | null {
    for (let i = 0; i < samples.length; i++) {
      this.ring[this.write] = (samples[i] ?? 0) / 32768;
      this.write = (this.write + 1) % BUF;
      if (this.filled < BUF) this.filled += 1;
      this.since += 1;
    }
    if (this.filled < BUF || this.since < this.hop) return null;
    this.since = 0;

    const win = new Float32Array(BUF);
    let idx = (this.write - BUF + BUF) % BUF;
    for (let i = 0; i < BUF; i++) {
      win[i] = this.ring[idx] ?? 0;
      idx = (idx + 1) % BUF;
    }
    return yinPitch(win, this.fs);
  }

  reset(): void {
    this.write = 0;
    this.filled = 0;
    this.since = 0;
  }
}
