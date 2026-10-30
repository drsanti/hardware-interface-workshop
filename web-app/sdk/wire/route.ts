import protobuf from "protobufjs";

/** RouteCfg — host → MCU uplink transport select (`0x88`). */
export const MSG_CMD_ROUTE = 0x88;

/** Bitmask for `RouteCfg.uplink` (matches firmware `RB_UPLINK_ROUTE_*`). */
export const UPLINK_ROUTE_SERIAL = 0x01;
export const UPLINK_ROUTE_ZENOH = 0x02;
export const UPLINK_ROUTE_BLE = 0x04;
/** Serial ∥ zenoh ∥ BLE — typical Web Bluetooth session. */
export const UPLINK_ROUTE_ALL =
  UPLINK_ROUTE_SERIAL | UPLINK_ROUTE_ZENOH | UPLINK_ROUTE_BLE;

const RouteCfgType = new protobuf.Type("RouteCfg").add(
  new protobuf.Field("uplink", 1, "uint32"),
);

/** Encode `RouteCfg` payload (msg type `MSG_CMD_ROUTE`). */
export function encodeRouteCfg(uplink: number): Uint8Array {
  return RouteCfgType.encode(
    RouteCfgType.create({ uplink: uplink >>> 0 }),
  ).finish();
}
