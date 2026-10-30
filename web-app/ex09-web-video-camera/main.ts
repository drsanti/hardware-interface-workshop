/**
 * Web video camera — focus here.
 *
 *   getUserMedia({ video: true })
 *   video.srcObject = stream
 *
 * UI markup: index.html · paint helpers: ui.ts
 */

import { setButtons, setLive, setReadout, ui } from "./ui";

let stream: MediaStream | null = null;

function refreshReadout(extra = ""): void {
  const state = stream ? "live" : "idle";
  setReadout(`state=${state}${extra ? ` · ${extra}` : ""}`);
}

async function startCamera(): Promise<void> {
  if (stream) return;
  setButtons({ start: false, stop: false });
  refreshReadout("requesting permission…");

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false,
    });
    ui.video.srcObject = stream;
    await ui.video.play();

    const track = stream.getVideoTracks()[0];
    const settings = track?.getSettings();
    const w = settings?.width ?? ui.video.videoWidth;
    const h = settings?.height ?? ui.video.videoHeight;

    setLive(true);
    setButtons({ start: false, stop: true });
    refreshReadout(w && h ? `${w}×${h}` : (track?.label ?? "ok"));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    refreshReadout(`error: ${msg}`);
    stopCamera();
  }
}

function stopCamera(): void {
  if (stream) {
    for (const track of stream.getTracks()) {
      track.stop();
    }
    stream = null;
  }
  ui.video.srcObject = null;
  setLive(false);
  setButtons({ start: true, stop: false });
  refreshReadout();
}

ui.start.addEventListener("click", () => {
  void startCamera();
});
ui.stop.addEventListener("click", stopCamera);

refreshReadout();
