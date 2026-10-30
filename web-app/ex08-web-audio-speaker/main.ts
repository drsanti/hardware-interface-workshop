/**
 * Web Audio speaker — focus here.
 *
 *   AudioContext.resume()          // after a click
 *   OscillatorNode → GainNode → destination
 *
 * UI markup: index.html · paint helpers: ui.ts
 */

import { setButtons, setReadout, setSliderLabels, ui } from "./ui";

let audioCtx: AudioContext | null = null;
let osc: OscillatorNode | null = null;
let gainNode: GainNode | null = null;
let playing = false;

function freqHz(): number {
  return Number(ui.freq.value);
}

function gainAmount(): number {
  return Number(ui.gain.value);
}

function refreshLabels(): void {
  setSliderLabels(freqHz(), gainAmount());
}

function refreshReadout(extra = ""): void {
  const state = playing ? "playing" : "idle";
  const ctxState = audioCtx?.state ?? "none";
  setReadout(`state=${state} · ctx=${ctxState}${extra ? ` · ${extra}` : ""}`);
}

async function ensureContext(): Promise<AudioContext> {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === "suspended") {
    await audioCtx.resume();
  }
  return audioCtx;
}

async function playTone(): Promise<void> {
  if (playing) return;
  setButtons({ play: false, stop: false });

  try {
    const ctx = await ensureContext();
    const nextOsc = ctx.createOscillator();
    const nextGain = ctx.createGain();

    nextOsc.type = "sine";
    nextOsc.frequency.value = freqHz();
    nextGain.gain.value = gainAmount();

    nextOsc.connect(nextGain);
    nextGain.connect(ctx.destination);
    nextOsc.start();

    osc = nextOsc;
    gainNode = nextGain;
    playing = true;
    setButtons({ play: false, stop: true });
    refreshReadout(`f=${freqHz()}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    refreshReadout(`error: ${msg}`);
    setButtons({ play: true, stop: false });
  }
}

function stopTone(): void {
  if (osc) {
    try {
      osc.stop();
    } catch {
      /* already stopped */
    }
    osc.disconnect();
    osc = null;
  }
  if (gainNode) {
    gainNode.disconnect();
    gainNode = null;
  }
  playing = false;
  setButtons({ play: true, stop: false });
  refreshReadout();
}

ui.freq.addEventListener("input", () => {
  refreshLabels();
  if (osc) {
    osc.frequency.value = freqHz();
  }
  refreshReadout(playing ? `f=${freqHz()}` : "");
});

ui.gain.addEventListener("input", () => {
  refreshLabels();
  if (gainNode) {
    gainNode.gain.value = gainAmount();
  }
});

ui.play.addEventListener("click", () => {
  void playTone();
});
ui.stop.addEventListener("click", stopTone);

refreshLabels();
refreshReadout();
