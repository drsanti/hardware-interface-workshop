/**
 * Mic VU — Serial *or* BLE.
 *
 *   enable + gainPct  → writeAcked(MSG_MIC_CMD, encodeMicCmd(…))
 *   mute              → encodeMicCmd({ mute })
 *   AudioLevel        → levelToPercent(rms/peak) → bar width
 */

import {
  CAP,
  BoardSession,
  MSG_AUDIO_LEVEL,
  MSG_BOARD_INFO,
  MSG_MIC_CMD,
  bleUnsupportedReason,
  boardHas,
  decodeAudioLevel,
  decodeBoardInfo,
  encodeMicCmd,
  levelToPercent,
  serialUnsupportedReason,
  type AudioLevelView,
  type BoardInfoView,
} from "@sdk";

import {
  paintGain,
  paintVu,
  setAckText,
  setBanner,
  setControlsEnabled,
  setHint,
  setInfoText,
  setLinkButtons,
  setMuteLabel,
  setStatusText,
  ui,
} from "./ui";

const board = new BoardSession();
let info: BoardInfoView | null = null;
let level: AudioLevelView | null = null;
let micOn = false;
let muted = false;
let busy = false;

setHint("es3c28p · Mic on → speak → watch VU. Drag Gain → Apply. Mute silences uplink levels.");

function hasMic(): boolean {
  return info !== null && boardHas(CAP.MIC, info.caps);
}

function canControl(): boolean {
  return board.ready && hasMic();
}

function paint(): void {
  const serialReason = serialUnsupportedReason();
  const bleReason = bleUnsupportedReason();
  const picking = board.status === "picking";
  const open = board.status === "open" || picking;

  const parts: string[] = [];
  if (serialReason) parts.push(`USB: ${serialReason}`);
  if (bleReason) parts.push(`BLE: ${bleReason}`);
  if (info && !hasMic()) parts.push("Board has no mic (CAP.MIC) — use es3c28p.");
  setBanner(parts.length ? parts.join(" ") : null);

  setLinkButtons({
    serial: !serialReason && !open,
    ble: !bleReason && !open,
    disconnect: board.status !== "idle" && !picking,
  });

  setStatusText(
    [
      `status=${board.status}`,
      `ready=${board.ready}`,
      `transport=${board.transport ?? "—"}`,
      `micOn=${micOn}`,
      `muted=${muted}`,
      `message=${board.message ?? "—"}`,
    ].join("\n"),
  );

  if (!info) {
    setInfoText(
      board.ready
        ? "Listening for BoardInfo (0x28)…"
        : open
          ? "Waiting for BoardInfo…"
          : "Connect USB or BLE…",
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

  const active = micOn && level !== null;
  paintVu({
    active,
    rmsPct: levelToPercent(level?.rms ?? 0),
    peakPct: levelToPercent(level?.peak ?? 0),
    rms: level?.rms ?? 0,
    peak: level?.peak ?? 0,
    clipped: level?.clipped ?? false,
  });

  setMuteLabel(muted);
  paintGain();
  setControlsEnabled(!busy && canControl());
}

async function setMic(enable: boolean): Promise<void> {
  if (!canControl() || busy) return;
  busy = true;
  paint();
  try {
    const gainPct = Number(ui.gain.value);
    const rc = await board.writeAcked(
      MSG_MIC_CMD,
      encodeMicCmd(enable ? { enable: true, gainPct } : { enable: false }),
    );
    micOn = enable;
    if (!enable) {
      level = null;
      muted = false;
    }
    setAckText(enable ? `MicCmd enable gain=${gainPct} rc=${rc}` : `MicCmd enable=false rc=${rc}`);
  } catch (err) {
    setAckText(err instanceof Error ? err.message : String(err));
  } finally {
    busy = false;
    paint();
  }
}

async function toggleMute(): Promise<void> {
  if (!canControl() || busy || !micOn) return;
  busy = true;
  paint();
  try {
    const next = !muted;
    const rc = await board.writeAcked(MSG_MIC_CMD, encodeMicCmd({ mute: next }));
    muted = next;
    setAckText(`MicCmd mute=${next} rc=${rc}`);
  } catch (err) {
    setAckText(err instanceof Error ? err.message : String(err));
  } finally {
    busy = false;
    paint();
  }
}

async function applyGain(): Promise<void> {
  if (!canControl() || busy) return;
  busy = true;
  paint();
  try {
    const gainPct = Number(ui.gain.value);
    const rc = await board.writeAcked(MSG_MIC_CMD, encodeMicCmd({ gainPct }));
    setAckText(`MicCmd gain=${gainPct} rc=${rc}`);
  } catch (err) {
    setAckText(err instanceof Error ? err.message : String(err));
  } finally {
    busy = false;
    paint();
  }
}

board.onChange(() => {
  if (board.status === "idle" || board.status === "error") {
    info = null;
    level = null;
    micOn = false;
    muted = false;
    busy = false;
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
  if (frame.msgType !== MSG_AUDIO_LEVEL) return;
  level = decodeAudioLevel(frame.payload);
  paint();
});

ui.connectSerial.addEventListener("click", () => {
  info = null;
  level = null;
  micOn = false;
  muted = false;
  setAckText("—");
  paint();
  void board.connectSerial();
});

ui.connectBle.addEventListener("click", () => {
  info = null;
  level = null;
  micOn = false;
  muted = false;
  setAckText("—");
  paint();
  void board.connectBle();
});

ui.disconnect.addEventListener("click", () => {
  void board.disconnect();
});

ui.micOn.addEventListener("click", () => void setMic(true));
ui.micOff.addEventListener("click", () => void setMic(false));
ui.mute.addEventListener("click", () => void toggleMute());
ui.gain.addEventListener("input", () => paintGain());
ui.gainApply.addEventListener("click", () => void applyGain());
ui.gain.addEventListener("change", () => void applyGain());

paint();
