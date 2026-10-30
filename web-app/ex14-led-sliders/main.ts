/**
 * LED slider lab — Serial *or* BLE.
 *
 *   Sliders → effective RGB (base × intensity / 255)
 *   Live    → throttled writeFrame(MSG_LED_FX, solid)
 *   Apply   → writeAcked (wait CmdAck)
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
  setLinkButtons,
  setMixEnabled,
  setPreview,
  setStatusText,
  ui,
} from "./ui";

/** Max LED write rate while dragging (~12.5 Hz). */
const LIVE_MS = 80;

const board = new BoardSession();
let info: BoardInfoView | null = null;
let busy = false;
let liveTimer: ReturnType<typeof setTimeout> | null = null;
let livePending = false;

setHint(
  "USB (~2.5 s) or BLE (~0.4 s). Drag RGB + intensity; Live uses writeFrame, Apply uses writeAcked.",
);

function canDriveLed(): boolean {
  return board.ready && info !== null && boardHas(CAP.LED, info.caps);
}

function readBase(): Rgb {
  return {
    r: Number(ui.r.value),
    g: Number(ui.g.value),
    b: Number(ui.b.value),
  };
}

function readIntensity(): number {
  return Number(ui.intensity.value);
}

/** Firmware solid ignores LedFx.intensity — scale in the browser. */
function effectiveRgb(base: Rgb, intensity: number): Rgb {
  return {
    r: Math.round((base.r * intensity) / 255),
    g: Math.round((base.g * intensity) / 255),
    b: Math.round((base.b * intensity) / 255),
  };
}

function paintPreview(): Rgb {
  const base = readBase();
  const intensity = readIntensity();
  const out = effectiveRgb(base, intensity);
  setPreview(base, out, intensity);
  return out;
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
        ledOk ? "LED=yes" : "LED=no (try es3c28p)",
      ].join("\n"),
    );
  }

  setMixEnabled(!busy && canDriveLed());
  paintPreview();
}

async function sendLive(out: Rgb): Promise<void> {
  if (!canDriveLed()) return;
  try {
    await board.writeFrame(MSG_LED_FX, encodeLedSolid(out));
    setAckText(`live writeFrame solid out=${out.r},${out.g},${out.b}`);
  } catch (err) {
    setAckText(err instanceof Error ? err.message : String(err));
  }
}

function scheduleLive(): void {
  if (!ui.live.checked || !canDriveLed()) return;
  livePending = true;
  if (liveTimer !== null) return;
  liveTimer = setTimeout(() => {
    liveTimer = null;
    if (!livePending) return;
    livePending = false;
    void sendLive(paintPreview());
  }, LIVE_MS);
}

async function applyAcked(): Promise<void> {
  if (!canDriveLed() || busy) return;
  busy = true;
  paint();
  const out = paintPreview();
  setAckText("Apply…");
  try {
    const rc = await board.writeAcked(MSG_LED_FX, encodeLedSolid(out));
    setAckText(
      `Apply writeAcked solid out=${out.r},${out.g},${out.b} rc=${rc}`,
    );
  } catch (err) {
    setAckText(err instanceof Error ? err.message : String(err));
  } finally {
    busy = false;
    paint();
  }
}

async function sendOff(): Promise<void> {
  if (!canDriveLed() || busy) return;
  busy = true;
  paint();
  setAckText("Off…");
  try {
    const rc = await board.writeAcked(MSG_LED_FX, encodeLedOff());
    setAckText(`off rc=${rc}`);
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

for (const el of [ui.r, ui.g, ui.b, ui.intensity]) {
  el.addEventListener("input", () => {
    paintPreview();
    scheduleLive();
  });
}

ui.apply.addEventListener("click", () => {
  void applyAcked();
});

ui.off.addEventListener("click", () => {
  void sendOff();
});

paint();
