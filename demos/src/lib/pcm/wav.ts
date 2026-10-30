import { MIC_FS_HZ } from "@/lib/pcm/PcmFftBridge";

/** Build a mono 16-bit PCM WAV from int16 samples. */
export function encodeWavMono16(
  samples: Int16Array,
  sampleRate: number = MIC_FS_HZ,
): ArrayBuffer {
  const dataBytes = samples.byteLength;
  const buffer = new ArrayBuffer(44 + dataBytes);
  const view = new DataView(buffer);

  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };

  writeStr(0, "RIFF");
  view.setUint32(4, 36 + dataBytes, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true); /* PCM chunk size */
  view.setUint16(20, 1, true); /* audio format = PCM */
  view.setUint16(22, 1, true); /* mono */
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); /* byte rate */
  view.setUint16(32, 2, true); /* block align */
  view.setUint16(34, 16, true); /* bits per sample */
  writeStr(36, "data");
  view.setUint32(40, dataBytes, true);

  new Uint8Array(buffer, 44).set(new Uint8Array(samples.buffer, samples.byteOffset, dataBytes));
  return buffer;
}

export function wavBlob(samples: Int16Array, sampleRate: number = MIC_FS_HZ): Blob {
  return new Blob([encodeWavMono16(samples, sampleRate) as BlobPart], {
    type: "audio/wav",
  });
}

export function downloadWav(
  samples: Int16Array,
  filename = "mic-capture.wav",
  sampleRate: number = MIC_FS_HZ,
): void {
  const url = URL.createObjectURL(wavBlob(samples, sampleRate));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Play mono int16 through Web Audio (speakers). */
export async function playInt16Mono(
  samples: Int16Array,
  sampleRate: number = MIC_FS_HZ,
): Promise<AudioContext> {
  const ctx = new AudioContext({ sampleRate });
  const buf = ctx.createBuffer(1, samples.length, ctx.sampleRate);
  const ch = buf.getChannelData(0);
  const ratio = ctx.sampleRate / sampleRate;
  if (Math.abs(ratio - 1) < 0.01) {
    for (let i = 0; i < samples.length; i++) ch[i] = (samples[i] ?? 0) / 32768;
  } else {
    /* Rare: context rejected 16 kHz — nearest-neighbor stretch. */
    const outLen = Math.floor(samples.length * ratio);
    const stretched = ctx.createBuffer(1, outLen, ctx.sampleRate);
    const out = stretched.getChannelData(0);
    for (let i = 0; i < outLen; i++) {
      const src = Math.min(samples.length - 1, Math.floor(i / ratio));
      out[i] = (samples[src] ?? 0) / 32768;
    }
    const src = ctx.createBufferSource();
    src.buffer = stretched;
    src.connect(ctx.destination);
    if (ctx.state === "suspended") await ctx.resume();
    src.start();
    return ctx;
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.connect(ctx.destination);
  if (ctx.state === "suspended") await ctx.resume();
  src.start();
  return ctx;
}
