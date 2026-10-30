/**
 * LED lab — Serial *or* BLE; same frames.
 *
 *   Connect USB  → board.connectSerial()
 *   Connect BLE  → board.connectBle()
 *   LED buttons  → writeAcked(MSG_LED_FX, encodeLed…)
 *
 * UI markup: index.html · paint helpers: ui.ts
 */

import {
  CAP,
  BoardSession,
  MSG_BOARD_INFO,
  MSG_LED_FX,
  bleUnsupportedReason,
  boardHas,
  decodeBoardInfo,
  encodeLedBlink,
  encodeLedOff,
  encodeLedSolid,
  serialUnsupportedReason,
  type BoardInfoView,
  type Rgb,
} from "@sdk";

import {
  setAckText,
  setBanner,
  setHint,
  setInfoText,
  setLedButtons,
  setLinkButtons,
  setStatusText,
  setSwatch,
  ui,
} from "./ui";

const board = new BoardSession();
let info: BoardInfoView | null = null;
let busy = false;
let lastRgb: Rgb | null = null;

setHint(
  "Choose USB (settle ~2.5 s) or BLE (settle ~0.4 s). LED needs CAP.LED — use es3c28p.",
);

function canDriveLed(): boolean {
  return board.ready && info !== null && boardHas(CAP.LED, info.caps);
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
          ? "Waiting for BoardInfo frame (0x28)…"
          : "Connect USB or BLE to hear BoardInfo (0x28)…",
    );
  } else {
    const ledOk = boardHas(CAP.LED, info.caps);
    setInfoText(
      [
        `hw=${info.hwModel || "—"}`,
        `fw=${info.fwVersion || "—"}`,
        `mac=${info.mac || "—"}`,
        `caps=0x${info.caps.toString(16)}`,
        `features=${info.features.length ? info.features.join(", ") : "—"}`,
        ledOk ? "LED=yes" : "LED=no (this board has no RGB — try es3c28p)",
      ].join("\n"),
    );
  }

  setLedButtons(!busy && canDriveLed());
  setSwatch(lastRgb);
}

async function sendLed(label: string, payload: Uint8Array, rgb: Rgb | null): Promise<void> {
  if (!canDriveLed() || busy) return;
  busy = true;
  paint();
  setAckText(`Sending ${label}…`);
  try {
    const rc = await board.writeAcked(MSG_LED_FX, payload);
    lastRgb = rgb;
    setAckText(`msg=0x${MSG_LED_FX.toString(16)} label=${label} rc=${rc}`);
  } catch (err) {
    setAckText(err instanceof Error ? err.message : String(err));
  } finally {
    busy = false;
    paint();
  }
}

/* --- session --- */

board.onChange(() => {
  if (board.status === "idle" || board.status === "error") {
    info = null;
    lastRgb = null;
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
  lastRgb = null;
  setAckText("—");
  paint();
  void board.connectSerial();
});

ui.connectBle.addEventListener("click", () => {
  info = null;
  lastRgb = null;
  setAckText("—");
  paint();
  void board.connectBle();
});

ui.disconnect.addEventListener("click", () => {
  void board.disconnect();
});

ui.ledRed.addEventListener("click", () => {
  const rgb = { r: 220, g: 24, b: 24 };
  void sendLed("solid-red", encodeLedSolid(rgb), rgb);
});

ui.ledGreen.addEventListener("click", () => {
  const rgb = { r: 24, g: 200, b: 72 };
  void sendLed("solid-green", encodeLedSolid(rgb), rgb);
});

ui.ledBlink.addEventListener("click", () => {
  const rgb = { r: 40, g: 90, b: 255 };
  void sendLed("blink-blue", encodeLedBlink(rgb, 180, 180), rgb);
});

ui.ledOff.addEventListener("click", () => {
  void sendLed("off", encodeLedOff(), { r: 0, g: 0, b: 0 });
});

paint();
