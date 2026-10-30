/**
 * SFX live params — Serial *or* BLE.
 *
 *   Start loop: writeAcked(MSG_SFX_CMD, …)
 *   Knobs:      writeFrame(MSG_SFX_PARAM, encodeSfxParam(stage, field, v))
 *
 * Stages (firmware): 0xFF master · 5 delay (1=mix) · 4 ADSR (3=rel_ms)
 */

import {
  BoardSession,
  MSG_BOARD_INFO,
  MSG_SFX_CMD,
  MSG_SFX_PARAM,
  SFX_PRESET,
  bleUnsupportedReason,
  decodeBoardInfo,
  encodeSfxParam,
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

const LIVE_MS = 80;
const STAGE_MASTER = 0xff;
const STAGE_DELAY = 5;
const FIELD_DELAY_MIX = 1;
const STAGE_ADSR = 4;
const FIELD_ADSR_REL = 3;

const board = new BoardSession();
let info: BoardInfoView | null = null;
let busy = false;
let liveTimer: ReturnType<typeof setTimeout> | null = null;
let liveKind: "master" | "echo" | "release" | null = null;

setHint("Start a loop, then drag knobs. Master/Echo/Release are SfxParam (0x85) — live.");

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

async function startLoop(label: string, preset: number): Promise<void> {
  if (!canPlay() || busy) return;
  busy = true;
  paint();
  try {
    const master = Number(ui.master.value);
    const rc = await board.writeAcked(
      MSG_SFX_CMD,
      encodeSfxPlay(preset, { volume: master, loops: 0 }),
    );
    setAckText(`start ${label} preset=${preset} vol=${master} rc=${rc}`);
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

async function sendParam(kind: "master" | "echo" | "release"): Promise<void> {
  if (!canPlay()) return;
  try {
    if (kind === "master") {
      const v = Number(ui.master.value);
      await board.writeFrame(MSG_SFX_PARAM, encodeSfxParam(STAGE_MASTER, 0, v));
      setAckText(`live master stage=0xFF v=${v}`);
    } else if (kind === "echo") {
      const v = Number(ui.echo.value) / 100;
      await board.writeFrame(MSG_SFX_PARAM, encodeSfxParam(STAGE_DELAY, FIELD_DELAY_MIX, v));
      setAckText(`live echo mix=${v.toFixed(2)}`);
    } else {
      const v = Number(ui.release.value);
      await board.writeFrame(MSG_SFX_PARAM, encodeSfxParam(STAGE_ADSR, FIELD_ADSR_REL, v));
      setAckText(`live release=${v} ms`);
    }
  } catch (err) {
    setAckText(err instanceof Error ? err.message : String(err));
  }
}

function scheduleLive(kind: "master" | "echo" | "release"): void {
  liveKind = kind;
  paintSliders();
  if (liveTimer !== null) return;
  liveTimer = setTimeout(() => {
    liveTimer = null;
    const k = liveKind;
    liveKind = null;
    if (k) void sendParam(k);
  }, LIVE_MS);
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

ui.sfxAlarm.addEventListener("click", () => void startLoop("alarm", SFX_PRESET.ALARM));
ui.sfxAmbulance.addEventListener("click", () =>
  void startLoop("ambulance", SFX_PRESET.AMBULANCE),
);
ui.sfxStop.addEventListener("click", () => void stop());

ui.master.addEventListener("input", () => scheduleLive("master"));
ui.echo.addEventListener("input", () => scheduleLive("echo"));
ui.release.addEventListener("input", () => scheduleLive("release"));

paint();
