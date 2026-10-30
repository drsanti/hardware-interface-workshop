/**
 * Wave lab — Serial *or* BLE; WaveCmd into the RGB LED.
 *
 *   Connect USB / BLE
 *   LedFx off (clear forever-hold) then WaveCmd 0x83
 *
 * Semantic LedFx effects: ex12-led-writeacked.
 * UI markup: index.html · paint helpers: ui.ts
 */

import {
  CAP,
  BoardSession,
  MSG_BOARD_INFO,
  MSG_CMD_WAVE,
  MSG_LED_FX,
  WAVE_SHAPE,
  bleUnsupportedReason,
  boardHas,
  decodeBoardInfo,
  encodeLedOff,
  encodeWaveAll,
  encodeWaveColorWheel,
  encodeWaveStop,
  serialUnsupportedReason,
  type BoardInfoView,
} from "@sdk";

import {
  setAckText,
  setBanner,
  setHint,
  setInfoText,
  setLinkButtons,
  setStatusText,
  setWaveButtons,
  ui,
} from "./ui";

const board = new BoardSession();
let info: BoardInfoView | null = null;
let busy = false;

setHint(
  "USB (~2.5 s settle) or BLE (~0.4 s). WaveCmd needs CAP.LED — es3c28p. LedFx → ex12.",
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

  setWaveButtons(!busy && canDriveLed());
}

/** Clear LedFx hold (`rb_fx_led_stop`), then run WaveCmd(s). */
async function sendWaves(label: string, payloads: Uint8Array[]): Promise<void> {
  if (!canDriveLed() || busy) return;
  busy = true;
  paint();
  setAckText(`Sending ${label}…`);
  try {
    const rcs: string[] = [];
    const rcOff = await board.writeAcked(MSG_LED_FX, encodeLedOff());
    rcs.push(`0x${MSG_LED_FX.toString(16)} off→rc=${rcOff}`);
    for (const payload of payloads) {
      const rc = await board.writeAcked(MSG_CMD_WAVE, payload);
      rcs.push(`0x${MSG_CMD_WAVE.toString(16)}→rc=${rc}`);
    }
    setAckText(`${label}\n${rcs.join("\n")}`);
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

ui.waveSin.addEventListener("click", () => {
  void sendWaves("wave-sin-colorwheel", encodeWaveColorWheel());
});

ui.waveSquare.addEventListener("click", () => {
  void sendWaves("wave-square", [encodeWaveAll(WAVE_SHAPE.SQUARE, 0.6, { dutyPct: 40 })]);
});

ui.waveTriangle.addEventListener("click", () => {
  void sendWaves("wave-triangle", [encodeWaveAll(WAVE_SHAPE.TRIANGLE, 0.45)]);
});

ui.waveSaw.addEventListener("click", () => {
  void sendWaves("wave-sawtooth", [encodeWaveAll(WAVE_SHAPE.SAWTOOTH, 0.45)]);
});

ui.waveStop.addEventListener("click", () => {
  void sendWaves("wave-stop", [encodeWaveStop(255)]);
});

paint();
