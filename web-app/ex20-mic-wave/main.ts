/**
 * Mic wave — Web Serial only (PCM is too heavy for BLE).
 *
 *   Stream on:  writeAcked(MSG_MIC_CMD, encodeMicCmd({ stream: true, enable: true }))
 *   MicPcm:     decodeMicPcm → ring buffer → paintWave
 */

import {
  CAP,
  BoardSession,
  MSG_AUDIO_LEVEL,
  MSG_BOARD_INFO,
  MSG_MIC_CMD,
  MSG_MIC_PCM,
  boardHas,
  decodeAudioLevel,
  decodeBoardInfo,
  decodeMicPcm,
  encodeMicCmd,
  levelToPercent,
  serialUnsupportedReason,
  type AudioLevelView,
  type BoardInfoView,
} from "@sdk";

import {
  paintVu,
  paintWave,
  setAckText,
  setBanner,
  setControlsEnabled,
  setHint,
  setInfoText,
  setLinkButtons,
  setStatusText,
  ui,
} from "./ui";

const PCM_HISTORY = 320;

const board = new BoardSession();
let info: BoardInfoView | null = null;
let level: AudioLevelView | null = null;
let streaming = false;
let busy = false;
const waveHist = new Float32Array(PCM_HISTORY);

setHint("es3c28p + USB only. Stream PCM → speak → green scope moves. Stream off before disconnect.");

function hasMic(): boolean {
  return info !== null && boardHas(CAP.MIC, info.caps);
}

function canControl(): boolean {
  return board.ready && hasMic();
}

function clearWave(): void {
  waveHist.fill(0);
  paintWave(waveHist);
}

function paint(): void {
  const serialReason = serialUnsupportedReason();
  const picking = board.status === "picking";
  const open = board.status === "open" || picking;

  const parts: string[] = [];
  if (serialReason) parts.push(`USB: ${serialReason}`);
  if (info && !hasMic()) parts.push("Board has no mic (CAP.MIC) — use es3c28p.");
  if (board.transport === "ble") parts.push("PCM needs USB Serial — reconnect with Connect USB.");
  setBanner(parts.length ? parts.join(" ") : null);

  setLinkButtons({
    serial: !serialReason && !open,
    disconnect: board.status !== "idle" && !picking,
  });

  setStatusText(
    [
      `status=${board.status}`,
      `ready=${board.ready}`,
      `transport=${board.transport ?? "—"}`,
      `streaming=${streaming}`,
      `message=${board.message ?? "—"}`,
    ].join("\n"),
  );

  if (!info) {
    setInfoText(
      board.ready
        ? "Listening for BoardInfo (0x28)…"
        : open
          ? "Waiting for BoardInfo…"
          : "Connect USB…",
    );
  } else {
    setInfoText(
      [
        `hw=${info.hwModel || "—"}`,
        `fw=${info.fwVersion || "—"}`,
        `caps=0x${info.caps.toString(16)}`,
        hasMic() ? "MIC=yes" : "MIC=no",
      ].join("\n"),
    );
  }

  const active = streaming && level !== null;
  paintVu({
    active,
    rmsPct: levelToPercent(level?.rms ?? 0),
    rms: level?.rms ?? 0,
    peak: level?.peak ?? 0,
    clipped: level?.clipped ?? false,
  });

  setControlsEnabled(!busy && canControl());
}

async function setStream(on: boolean): Promise<void> {
  if (!canControl() || busy) return;
  busy = true;
  paint();
  try {
    const rc = await board.writeAcked(
      MSG_MIC_CMD,
      encodeMicCmd(on ? { stream: true, enable: true, gainPct: 70 } : { stream: false }),
    );
    streaming = on;
    if (!on) {
      level = null;
      clearWave();
    }
    setAckText(on ? `MicCmd stream=on rc=${rc}` : `MicCmd stream=off rc=${rc}`);
  } catch (err) {
    setAckText(err instanceof Error ? err.message : String(err));
  } finally {
    busy = false;
    paint();
  }
}

async function micOff(): Promise<void> {
  if (!canControl() || busy) return;
  busy = true;
  paint();
  try {
    const rc = await board.writeAcked(
      MSG_MIC_CMD,
      encodeMicCmd({ enable: false, stream: false }),
    );
    streaming = false;
    level = null;
    clearWave();
    setAckText(`MicCmd enable=false rc=${rc}`);
  } catch (err) {
    setAckText(err instanceof Error ? err.message : String(err));
  } finally {
    busy = false;
    paint();
  }
}

function pushPcm(samples: Int16Array): void {
  /* Keep ~64 points per chunk for a readable scope. */
  const step = Math.max(1, Math.floor(samples.length / 64));
  for (let i = 0; i < samples.length; i += step) {
    const v = (samples[i] ?? 0) / 32768;
    waveHist.copyWithin(0, 1);
    waveHist[waveHist.length - 1] = v;
  }
  paintWave(waveHist);
}

board.onChange(() => {
  if (board.status === "idle" || board.status === "error") {
    info = null;
    level = null;
    streaming = false;
    busy = false;
    clearWave();
    setAckText("—");
  }
  paint();
});

board.subscribe((frame) => {
  if (frame.msgType === MSG_BOARD_INFO) {
    info = decodeBoardInfo(frame.payload);
    paint();
    return;
  }
  if (frame.msgType === MSG_AUDIO_LEVEL) {
    level = decodeAudioLevel(frame.payload);
    paint();
    return;
  }
  if (frame.msgType !== MSG_MIC_PCM) return;
  const pcm = decodeMicPcm(frame.payload);
  pushPcm(pcm.samples);
});

ui.connectSerial.addEventListener("click", () => {
  info = null;
  level = null;
  streaming = false;
  clearWave();
  setAckText("—");
  paint();
  void board.connectSerial();
});

ui.disconnect.addEventListener("click", () => {
  void board.disconnect();
});

ui.streamOn.addEventListener("click", () => void setStream(true));
ui.streamOff.addEventListener("click", () => void setStream(false));
ui.micOff.addEventListener("click", () => void micOff());

clearWave();
paint();
