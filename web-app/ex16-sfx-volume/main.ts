/**
 * SFX volume lab — Serial *or* BLE.
 *
 *   encodeSfxPlay(preset, { volume, loops })
 *   volume/loops apply on the *next* play only (not live DSP).
 */

import {
  BoardSession,
  MSG_BOARD_INFO,
  MSG_SFX_CMD,
  SFX_PRESET,
  bleUnsupportedReason,
  decodeBoardInfo,
  encodeSfxPlay,
  encodeSfxStop,
  serialUnsupportedReason,
  type BoardInfoView,
} from "@sdk";

import {
  paintSliders,
  setAckText,
  setBanner,
  setControlsEnabled,
  setHint,
  setInfoText,
  setLinkButtons,
  setStatusText,
  ui,
} from "./ui";

const board = new BoardSession();
let info: BoardInfoView | null = null;
let busy = false;

setHint("Set Volume / Loops, then Play. Loops 0 = board default (sirens may run until Stop).");

function canPlay(): boolean {
  return board.ready;
}

function paint(): void {
  const serialReason = serialUnsupportedReason();
  const bleReason = bleUnsupportedReason();
  const picking = board.status === "picking";
  const open = board.status === "open" || picking;

  const parts: string[] = [];
  if (serialReason) parts.push(`USB: ${serialReason}`);
  if (bleReason) parts.push(`BLE: ${bleReason}`);
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
      [`hw=${info.hwModel || "—"}`, `fw=${info.fwVersion || "—"}`, `mac=${info.mac || "—"}`].join(
        "\n",
      ),
    );
  }

  setControlsEnabled(!busy && canPlay());
  paintSliders();
}

async function play(label: string, preset: number): Promise<void> {
  if (!canPlay() || busy) return;
  busy = true;
  paint();
  const volume = Number(ui.volume.value);
  const loops = Number(ui.loops.value);
  setAckText(`Playing ${label}…`);
  try {
    const rc = await board.writeAcked(
      MSG_SFX_CMD,
      encodeSfxPlay(preset, { volume, loops }),
    );
    setAckText(`play ${label} preset=${preset} vol=${volume} loops=${loops} rc=${rc}`);
  } catch (err) {
    setAckText(err instanceof Error ? err.message : String(err));
  } finally {
    busy = false;
    paint();
  }
}

async function stop(): Promise<void> {
  if (!canPlay() || busy) return;
  busy = true;
  paint();
  try {
    const rc = await board.writeAcked(MSG_SFX_CMD, encodeSfxStop());
    setAckText(`stop rc=${rc}`);
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
    busy = false;
    setAckText("—");
  }
  paint();
});

board.subscribe((frame) => {
  if (frame.msgType !== MSG_BOARD_INFO) return;
  info = decodeBoardInfo(frame.payload);
  paint();
});

ui.connectSerial.addEventListener("click", () => {
  info = null;
  setAckText("—");
  paint();
  void board.connectSerial();
});

ui.connectBle.addEventListener("click", () => {
  info = null;
  setAckText("—");
  paint();
  void board.connectBle();
});

ui.disconnect.addEventListener("click", () => {
  void board.disconnect();
});

ui.volume.addEventListener("input", paintSliders);
ui.loops.addEventListener("input", paintSliders);

ui.sfxBeep.addEventListener("click", () => void play("beep", SFX_PRESET.BEEP));
ui.sfxChime.addEventListener("click", () => void play("chime", SFX_PRESET.CHIME));
ui.sfxAlarm.addEventListener("click", () => void play("alarm", SFX_PRESET.ALARM));
ui.sfxStop.addEventListener("click", () => void stop());

paint();
