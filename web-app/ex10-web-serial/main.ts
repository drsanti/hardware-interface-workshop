/**
 * Web Serial lab — focus here.
 *
 *   BoardSession.connectSerial()   // click → port picker
 *   onChange → status / ready
 *   subscribe(MSG_BOARD_INFO) → decodeBoardInfo
 *
 * UI markup: index.html · paint helpers: ui.ts
 */

import {
  BoardSession,
  MSG_BOARD_INFO,
  SERIAL_BAUD,
  SERIAL_SETTLE_MS,
  decodeBoardInfo,
  serialUnsupportedReason,
  type BoardInfoView,
} from "@sdk";

import { setBanner, setButtons, setHint, setInfoText, setStatusText, ui } from "./ui";

const board = new BoardSession();
let info: BoardInfoView | null = null;

setHint(
  `Baud ${SERIAL_BAUD}. After the port opens, wait ~${SERIAL_SETTLE_MS / 1000}s settle before ready / BoardInfo.`,
);

function paint(): void {
  const unsupported = serialUnsupportedReason();
  setBanner(unsupported);

  const picking = board.status === "picking";
  const open = board.status === "open" || picking;
  setButtons({
    connect: !unsupported && !open,
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
    setInfoText("Waiting for BoardInfo frame (0x28)…");
    return;
  }

  setInfoText(
    [
      `hw=${info.hwModel || "—"}`,
      `fw=${info.fwVersion || "—"}`,
      `mac=${info.mac || "—"}`,
      `uuid=${info.uuid || "—"}`,
      `synced=${info.synced}`,
      `caps=0x${info.caps.toString(16)}`,
      `features=${info.features.length ? info.features.join(", ") : "—"}`,
    ].join("\n"),
  );
}

/* --- serial session --- */

board.onChange(() => {
  if (board.status === "idle" || board.status === "error") {
    info = null;
  }
  paint();
});

board.subscribe((frame) => {
  if (frame.msgType !== MSG_BOARD_INFO) return;
  info = decodeBoardInfo(frame.payload);
  paint();
});

ui.connect.addEventListener("click", () => {
  info = null;
  paint();
  // Must run from a user gesture (this click).
  void board.connectSerial();
});

ui.disconnect.addEventListener("click", () => {
  void board.disconnect();
});

paint();
