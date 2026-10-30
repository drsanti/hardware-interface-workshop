import { MIC_FS_HZ } from "@/lib/pcm/PcmFftBridge";

const RING = MIC_FS_HZ; /* ~1 s */
const PROC_SIZE = 512;

/**
 * Push float PCM into a Web Audio ScriptProcessor for live monitoring.
 * Audible (not silent) — used by the filter lab.
 */
export class PcmPlaybackBridge {
  private ctx: AudioContext | null = null;
  private proc: ScriptProcessorNode | null = null;
  private gain: GainNode | null = null;
  private ring = new Float32Array(RING);
  private write = 0;
  private read = 0;
  private available = 0;
  private volume = 0.7;

  get sampleRate(): number {
    return this.ctx?.sampleRate ?? MIC_FS_HZ;
  }

  setVolume(v: number): void {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.gain) this.gain.gain.value = this.volume;
  }

  async start(): Promise<void> {
    if (this.ctx) {
      if (this.ctx.state === "suspended") await this.ctx.resume();
      return;
    }

    const ctx = new AudioContext({ sampleRate: MIC_FS_HZ });
    const gain = ctx.createGain();
    gain.gain.value = this.volume;

    /* 0 inputs = source node (pull from our ring). */
    const proc = ctx.createScriptProcessor(PROC_SIZE, 0, 1);
    proc.onaudioprocess = (ev) => {
      const out = ev.outputBuffer.getChannelData(0);
      this.pull(out);
    };

    proc.connect(gain);
    gain.connect(ctx.destination);

    this.ctx = ctx;
    this.proc = proc;
    this.gain = gain;
    if (ctx.state === "suspended") await ctx.resume();
  }

  /** Push float (−1..1) samples @ 16 kHz; stretches if context ≠ 16 kHz. */
  pushFloat(samples: Float32Array): void {
    const ratio = Math.max(1, Math.round(this.sampleRate / MIC_FS_HZ));
    for (let i = 0; i < samples.length; i++) {
      const f = samples[i] ?? 0;
      for (let r = 0; r < ratio; r++) {
        this.ring[this.write] = f;
        this.write = (this.write + 1) % RING;
        if (this.available < RING) this.available += 1;
        else this.read = (this.read + 1) % RING;
      }
    }
  }

  stop(): void {
    this.available = 0;
    this.read = 0;
    this.write = 0;
  }

  dispose(): void {
    try {
      this.proc?.disconnect();
    } catch {
      /* ok */
    }
    try {
      this.gain?.disconnect();
    } catch {
      /* ok */
    }
    this.proc = null;
    this.gain = null;
    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
    }
    this.stop();
  }

  private pull(out: Float32Array): void {
    for (let i = 0; i < out.length; i++) {
      if (this.available > 0) {
        out[i] = this.ring[this.read] ?? 0;
        this.read = (this.read + 1) % RING;
        this.available -= 1;
      } else {
        out[i] = 0;
      }
    }
  }
}
