/**
 * Web Audio mic — focus here.
 *
 *   getUserMedia({ audio: true })
 *   AudioContext.createMediaStreamSource(stream)
 *   AnalyserNode.getByteTimeDomainData(...)
 *
 * UI markup: index.html · paint helpers: ui.ts
 */

import { setButtons, setLevel, setReadout, ui } from "./ui";

let stream: MediaStream | null = null;
let audioCtx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let raf = 0;
let timeData: Uint8Array<ArrayBuffer> | null = null;

function refreshReadout(extra = ""): void {
  const state = stream ? "listening" : "idle";
  setReadout(`state=${state}${extra ? ` · ${extra}` : ""}`);
}

function tick(): void {
  if (!analyser || !timeData) return;
  analyser.getByteTimeDomainData(timeData);

  // Peak deviation from silence (128) → rough amplitude 0…1
  let peak = 0;
  for (let i = 0; i < timeData.length; i++) {
    const sample = timeData[i] ?? 128;
    const d = Math.abs(sample - 128) / 128;
    if (d > peak) peak = d;
  }
  setLevel(peak * 100);
  raf = requestAnimationFrame(tick);
}

async function startMic(): Promise<void> {
  if (stream) return;
  setButtons({ start: false, stop: false });
  refreshReadout("requesting permission…");

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    audioCtx = new AudioContext();
    await audioCtx.resume();

    const source = audioCtx.createMediaStreamSource(stream);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);
    // Do not connect to destination — this lab is input-only (no feedback loop).

    timeData = new Uint8Array(analyser.fftSize);
    setButtons({ start: false, stop: true });
    refreshReadout(`sampleRate=${audioCtx.sampleRate}`);
    raf = requestAnimationFrame(tick);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    refreshReadout(`error: ${msg}`);
    await stopMic();
  }
}

async function stopMic(): Promise<void> {
  cancelAnimationFrame(raf);
  raf = 0;
  setLevel(0);

  if (stream) {
    for (const track of stream.getTracks()) {
      track.stop();
    }
    stream = null;
  }
  analyser = null;
  timeData = null;

  if (audioCtx) {
    await audioCtx.close();
    audioCtx = null;
  }

  setButtons({ start: true, stop: false });
  refreshReadout();
}

ui.start.addEventListener("click", () => {
  void startMic();
});
ui.stop.addEventListener("click", () => {
  void stopMic();
});

refreshReadout();
