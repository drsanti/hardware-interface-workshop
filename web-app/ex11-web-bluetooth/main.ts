/**
 * Web Bluetooth lab — focus here.
 *
 *   BoardSession.connectBle()   // click → device picker
 *   onChange → status / ready
 *   subscribe(MSG_BOARD_INFO) → decodeBoardInfo
 *
 * Same frames as ex10; only the pipe is different (transport="ble").
 * UI markup: index.html · paint helpers: ui.ts
 */

import {
  BLE_SETTLE_MS,
  BLE_SVC,
  BoardSession,
  MSG_BOARD_INFO,
  bleUnsupportedReason,
  decodeBoardInfo,
  type BoardInfoView,
} from "@sdk";

import { setBanner, setButtons, setHint, setInfoText, setStatusText, ui } from "./ui";

const board = new BoardSession();
let info: BoardInfoView | null = null;

setHint(
  `GATT service ${BLE_SVC.slice(0, 8)}… Settle ~${BLE_SETTLE_MS} ms after notify setup. Look for rb-* / robotos in the picker.`,
);

function paint(): void {
  const unsupported = bleUnsupportedReason();
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
    setInfoText(
      board.ready
        ? "Listening for BoardInfo (0x28)… should arrive right after connect (RouteCfg + BLE subscribe)."
        : "Waiting for BoardInfo frame (0x28)…",
    );
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

/* --- bluetooth session --- */

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
  void board.connectBle();
});

ui.disconnect.addEventListener("click", () => {
  void board.disconnect();
});

paint();
