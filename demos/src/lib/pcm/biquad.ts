import { MIC_FS_HZ } from "@/lib/pcm/PcmFftBridge";

export type BiquadKind = "bypass" | "lowpass" | "highpass" | "bandpass";

/**
 * Transposed direct-form II biquad (RBJ Audio EQ Cookbook).
 * Process float samples in (−1..1) at `sampleRate`.
 */
export class Biquad {
  private b0 = 1;
  private b1 = 0;
  private b2 = 0;
  private a1 = 0;
  private a2 = 0;
  private z1 = 0;
  private z2 = 0;
  private kind: BiquadKind = "bypass";
  private fc = 1000;
  private q = 0.707;
  private readonly fs: number;

  constructor(sampleRate: number = MIC_FS_HZ) {
    this.fs = sampleRate;
  }

  get type(): BiquadKind {
    return this.kind;
  }

  get cutoffHz(): number {
    return this.fc;
  }

  get quality(): number {
    return this.q;
  }

  configure(kind: BiquadKind, cutoffHz: number, q: number): void {
    this.kind = kind;
    this.fc = Math.max(20, Math.min(this.fs * 0.49, cutoffHz));
    this.q = Math.max(0.1, Math.min(20, q));
    if (kind === "bypass") {
      this.b0 = 1;
      this.b1 = 0;
      this.b2 = 0;
      this.a1 = 0;
      this.a2 = 0;
      return;
    }

    const w0 = (2 * Math.PI * this.fc) / this.fs;
    const cos = Math.cos(w0);
    const sin = Math.sin(w0);
    const alpha = sin / (2 * this.q);
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    let a0 = 1;
    let a1 = 0;
    let a2 = 0;

    if (kind === "lowpass") {
      b0 = (1 - cos) / 2;
      b1 = 1 - cos;
      b2 = (1 - cos) / 2;
      a0 = 1 + alpha;
      a1 = -2 * cos;
      a2 = 1 - alpha;
    } else if (kind === "highpass") {
      b0 = (1 + cos) / 2;
      b1 = -(1 + cos);
      b2 = (1 + cos) / 2;
      a0 = 1 + alpha;
      a1 = -2 * cos;
      a2 = 1 - alpha;
    } else {
      /* bandpass (constant skirt gain, peak gain = Q) */
      b0 = alpha;
      b1 = 0;
      b2 = -alpha;
      a0 = 1 + alpha;
      a1 = -2 * cos;
      a2 = 1 - alpha;
    }

    this.b0 = b0 / a0;
    this.b1 = b1 / a0;
    this.b2 = b2 / a0;
    this.a1 = a1 / a0;
    this.a2 = a2 / a0;
  }

  reset(): void {
    this.z1 = 0;
    this.z2 = 0;
  }

  /** In-place process; returns the same buffer. */
  process(buf: Float32Array): Float32Array {
    if (this.kind === "bypass") return buf;
    const { b0, b1, b2, a1, a2 } = this;
    let z1 = this.z1;
    let z2 = this.z2;
    for (let i = 0; i < buf.length; i++) {
      const x = buf[i] ?? 0;
      const y = b0 * x + z1;
      z1 = b1 * x - a1 * y + z2;
      z2 = b2 * x - a2 * y;
      buf[i] = Math.max(-1, Math.min(1, y));
    }
    this.z1 = z1;
    this.z2 = z2;
    return buf;
  }

  processInt16(samples: Int16Array, out?: Float32Array): Float32Array {
    const dest = out && out.length >= samples.length ? out : new Float32Array(samples.length);
    for (let i = 0; i < samples.length; i++) dest[i] = (samples[i] ?? 0) / 32768;
    return this.process(dest.subarray(0, samples.length));
  }
}
