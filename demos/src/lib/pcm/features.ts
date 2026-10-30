import { fftRadix2, hann } from "@/lib/pcm/fft";
import { MIC_FS_HZ } from "@/lib/pcm/PcmFftBridge";

export type AudioFeatures = {
  /** RMS of the window (0..1). */
  rms: number;
  /** Zero-crossing rate (crossings per sample, ~0..1). */
  zcr: number;
  /** Spectral centroid in Hz. */
  centroidHz: number;
  /** Spectral flatness 0..1 (1 ≈ noise-like, 0 ≈ tonal). */
  flatness: number;
  /** Frequency below which `rolloffPct` of energy lies (Hz). */
  rolloffHz: number;
};

const FRAME = 512;
const ROLLOFF = 0.85;

/**
 * Extract common MIR features from a mono float window (−1..1).
 * Uses a Hann-windowed radix-2 FFT for spectral measures.
 */
export function extractFeatures(
  samples: Float32Array,
  sampleRate: number = MIC_FS_HZ,
): AudioFeatures {
  const n = Math.min(FRAME, samples.length);
  if (n < 8) {
    return { rms: 0, zcr: 0, centroidHz: 0, flatness: 0, rolloffHz: 0 };
  }

  let sumSq = 0;
  let crossings = 0;
  let prev = samples[samples.length - n] ?? 0;
  for (let i = samples.length - n; i < samples.length; i++) {
    const x = samples[i] ?? 0;
    sumSq += x * x;
    if ((prev >= 0 && x < 0) || (prev < 0 && x >= 0)) crossings += 1;
    prev = x;
  }
  const rms = Math.sqrt(sumSq / n);
  const zcr = crossings / n;

  const re = new Float32Array(FRAME);
  const im = new Float32Array(FRAME);
  const start = samples.length - n;
  for (let i = 0; i < n; i++) {
    re[i] = (samples[start + i] ?? 0) * hann(i, n);
  }
  /* Zero-pad if n < FRAME (already zero). */
  fftRadix2(re, im);

  const half = FRAME / 2;
  let weighted = 0;
  let magSum = 0;
  let logSum = 0;
  let logCount = 0;
  const mags = new Float32Array(half);

  for (let i = 1; i < half; i++) {
    const mag = Math.hypot(re[i] ?? 0, im[i] ?? 0);
    mags[i] = mag;
    const hz = (i * sampleRate) / FRAME;
    weighted += mag * hz;
    magSum += mag;
    if (mag > 1e-12) {
      logSum += Math.log(mag);
      logCount += 1;
    }
  }

  const centroidHz = magSum > 1e-12 ? weighted / magSum : 0;
  const flatness =
    magSum > 1e-12 && logCount > 0
      ? Math.min(1, Math.exp(logSum / logCount) / (magSum / (half - 1)))
      : 0;

  const target = magSum * ROLLOFF;
  let acc = 0;
  let rolloffHz = (sampleRate / 2) * ROLLOFF;
  for (let i = 1; i < half; i++) {
    acc += mags[i] ?? 0;
    if (acc >= target) {
      rolloffHz = (i * sampleRate) / FRAME;
      break;
    }
  }

  return { rms, zcr, centroidHz, flatness, rolloffHz };
}

/** Push int16 into a float ring and extract when enough samples land. */
export class FeatureTap {
  private ring = new Float32Array(FRAME * 2);
  private write = 0;
  private filled = 0;
  private since = 0;
  private readonly hop: number;
  private readonly fs: number;

  constructor(hop = 256, sampleRate: number = MIC_FS_HZ) {
    this.hop = hop;
    this.fs = sampleRate;
  }

  pushInt16(samples: Int16Array): AudioFeatures | null {
    for (let i = 0; i < samples.length; i++) {
      this.ring[this.write] = (samples[i] ?? 0) / 32768;
      this.write = (this.write + 1) % this.ring.length;
      if (this.filled < this.ring.length) this.filled += 1;
      this.since += 1;
    }
    if (this.filled < FRAME || this.since < this.hop) return null;
    this.since = 0;

    const win = new Float32Array(FRAME);
    let idx = (this.write - FRAME + this.ring.length) % this.ring.length;
    for (let i = 0; i < FRAME; i++) {
      win[i] = this.ring[idx] ?? 0;
      idx = (idx + 1) % this.ring.length;
    }
    return extractFeatures(win, this.fs);
  }

  reset(): void {
    this.write = 0;
    this.filled = 0;
    this.since = 0;
  }
}
