/**
 * Hardware Interface web SDK — Web Serial + Web Bluetooth to Cronos boards.
 *
 * Same COBS / protobuf wire as `demos/` and `firmware-esp32-s3-dev`.
 */

export {
  bleUnsupportedReason,
  hasWebBluetooth,
  hasWebSerial,
  isSecureContext,
  serialUnsupportedReason,
} from "./browser";
export { CAP, boardHas, featureLabels, type CapId } from "./caps";
export {
  BLE_RX,
  BLE_SVC,
  BLE_TX,
  BLE_WRITE_CHUNK,
  bleWrite,
  closeBleLink,
  openBleLink,
  type BleLink,
} from "./ble";
export {
  BLE_SETTLE_MS,
  BoardSession,
  SERIAL_BAUD,
  SERIAL_SETTLE_MS,
  type FrameHandler,
  type LinkStatus,
  type LinkTransport,
  type SessionChangeHandler,
} from "./session";
export * from "./wire";
