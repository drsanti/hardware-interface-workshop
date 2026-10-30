import { fftRadix2, hann } from "@/lib/pcm/fft";

/** Board mic capture rate (es8311 / sound stack). */
export const MIC_FS_HZ = 16_000;

const RING = MIC_FS_HZ; /* ~1 s of headroom */
const FFT_SIZE = 512;
/** Default hop between spectrogram columns (~16 ms @ 16 kHz). */
export const FFT_HOP = 256;

/**
 * Feed board MicPcm (int16 mono @ 16 kHz) into a ring buffer and compute
 * a live magnitude spectrum with an in-process FFT.
 *
 * Avoids Web Audio ScriptProcessor / silent-graph quirks — MicPcm alone
 * is enough for the ex26 bars / ex27 spectrogram.
 */
export class PcmFftBridge {
  private ring = new Float32Array(RING);
  private write = 0;
  private filled = 0;
  private readonly re: Float32Array;
  private readonly im: Float32Array;
  private readonly bins: Uint8Array<ArrayBuffer>;
  private readonly fftSize: number;
  private readonly hop: number;
  private sinceHop = 0;
  private running = false;

  constructor(fftSize = FFT_SIZE, hop = FFT_HOP) {
    if ((fftSize & (fftSize - 1)) !== 0) {
      throw new Error("fftSize must be a power of two");
    }
    this.fftSize = fftSize;
    this.hop = Math.max(1, Math.min(fftSize, hop));
    this.re = new Float32Array(fftSize);
    this.im = new Float32Array(fftSize);
    this.bins = new Uint8Array(new ArrayBuffer(fftSize / 2));
  }

  get sampleRate(): number {
    return MIC_FS_HZ;
  }

  get frequencyBinCount(): number {
    return this.fftSize / 2;
  }

  /** Hz of bin `i` (0 .. frequencyBinCount-1). */
  binHz(i: number): number {
    return (i * this.sampleRate) / this.fftSize;
  }

  async start(): Promise<void> {
    this.running = true;
  }

  /** Push one MicPcm chunk (int16 @ 16 kHz). */
  pushInt16(samples: Int16Array): void {
    if (!this.running) return;
    for (let i = 0; i < samples.length; i++) {
      this.ring[this.write] = (samples[i] ?? 0) / 32768;
      this.write = (this.write + 1) % RING;
      if (this.filled < RING) this.filled += 1;
      this.sinceHop += 1;
    }
  }

  /**
   * Magnitude spectrum mapped to 0..255 (dB-ish).
   * Needs at least `fftSize` samples in the ring.
   */
  getByteFrequencyData(): Uint8Array {
    this.computeBins();
    return this.bins;
  }

  /**
   * Spectrogram hop: return a fresh column when `hop` new samples arrived,
   * else `null`. Copies bins so the caller can keep the column.
   */
  takeColumn(): Uint8Array | null {
    if (!this.running || this.filled < this.fftSize) return null;
    if (this.sinceHop < this.hop) return null;
    this.sinceHop -= this.hop;
    this.computeBins();
    return Uint8Array.from(this.bins);
  }

  stop(): void {
    this.running = false;
    this.filled = 0;
    this.write = 0;
    this.sinceHop = 0;
    this.bins.fill(0);
  }

  private computeBins(): void {
    this.bins.fill(0);
    if (!this.running || this.filled < this.fftSize) return;

    /* Newest fftSize samples ending at `write`. */
    let idx = (this.write - this.fftSize + RING) % RING;
    for (let i = 0; i < this.fftSize; i++) {
      this.re[i] = (this.ring[idx] ?? 0) * hann(i, this.fftSize);
      this.im[i] = 0;
      idx = (idx + 1) % RING;
    }

    fftRadix2(this.re, this.im);

    const half = this.fftSize / 2;
    /* Speech is quiet vs full-scale — floor/ceil tuned for MicPcm. */
    const floorDb = -70;
    const ceilDb = -10;
    for (let i = 0; i < half; i++) {
      const mag = Math.hypot(this.re[i] ?? 0, this.im[i] ?? 0) / half;
      const db = mag > 1e-12 ? 20 * Math.log10(mag) : floorDb;
      const t = (db - floorDb) / (ceilDb - floorDb);
      this.bins[i] = Math.max(0, Math.min(255, Math.round(t * 255)));
    }
  }

  dispose(): void {
    this.stop();
  }
}
