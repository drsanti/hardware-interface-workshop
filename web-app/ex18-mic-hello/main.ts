/**
 * Mic hello — Serial *or* BLE.
 *
 *   writeAcked(MSG_MIC_CMD, encodeMicCmd({ enable: true/false }))
 *   subscribe MSG_AUDIO_LEVEL → decodeAudioLevel
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
  serialUnsupportedReason,
  type AudioLevelView,
  type BoardInfoView,
} from "@sdk";

import {
  setAckText,
  setBanner,
  setHint,
  setInfoText,
  setLevelText,
  setLinkButtons,
  setMicButtons,
  setStatusText,
  ui,
} from "./ui";

const board = new BoardSession();
let info: BoardInfoView | null = null;
let level: AudioLevelView | null = null;
let micOn = false;
let busy = false;

setHint("USB or BLE. Needs es3c28p (CAP.MIC). Mic on → speak/clap → watch rms/peak.");

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

  if (!micOn || !level) {
    setLevelText(micOn ? "Waiting for AudioLevel (0x23)…" : "Mic off — no levels yet.");
  } else {
    setLevelText(
      [
        `rms=${level.rms}`,
        `peak=${level.peak}`,
        `frames=${level.frames}`,
        `clipped=${level.clipped}`,
      ].join("\n"),
    );
  }

  setMicButtons(!busy && canControl());
}

async function setMic(enable: boolean): Promise<void> {
  if (!canControl() || busy) return;
  busy = true;
  paint();
  try {
    const rc = await board.writeAcked(MSG_MIC_CMD, encodeMicCmd({ enable }));
    micOn = enable;
    if (!enable) level = null;
    setAckText(`MicCmd enable=${enable} rc=${rc}`);
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
  setAckText("—");
  paint();
  void board.connectSerial();
});

ui.connectBle.addEventListener("click", () => {
  info = null;
  level = null;
  micOn = false;
  setAckText("—");
  paint();
  void board.connectBle();
});

ui.disconnect.addEventListener("click", () => {
  void board.disconnect();
});

ui.micOn.addEventListener("click", () => void setMic(true));
ui.micOff.addEventListener("click", () => void setMic(false));

paint();
