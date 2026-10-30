import protobuf from "protobufjs";

/** Board → host: physical button press (edge-triggered). */
export const MSG_KEY_EVENT = 0x2c;

export const KEY_EV = {
  UP: 0,
  DOWN: 1,
  SHORT: 2,
  LONG: 3,
  DOUBLE: 4,
} as const;

export type KeyEvId = (typeof KEY_EV)[keyof typeof KEY_EV];

export type KeyEventView = {
  timestampMs: number;
  key: number;
  event: KeyEvId;
  holdMs: number;
};

const KeyEventType = new protobuf.Type("KeyEvent")
  .add(new protobuf.Field("timestamp_ms", 1, "uint64"))
  .add(new protobuf.Field("key", 2, "uint32"))
  .add(new protobuf.Field("event", 3, "uint32"))
  .add(new protobuf.Field("hold_ms", 4, "uint32"));

export function decodeKeyEvent(payload: Uint8Array): KeyEventView {
  const msg = KeyEventType.toObject(KeyEventType.decode(payload), {
    longs: Number,
    defaults: true,
  }) as {
    timestamp_ms?: number;
    key?: number;
    event?: number;
    hold_ms?: number;
  };
  return {
    timestampMs: Number(msg.timestamp_ms ?? 0),
    key: Number(msg.key ?? 0),
    event: Number(msg.event ?? 0) as KeyEvId,
    holdMs: Number(msg.hold_ms ?? 0),
  };
}

export function keyLabel(key: number): string {
  if (key === 0) return "PWR";
  if (key === 1) return "BOOT";
  return `key ${key}`;
}

export function keyEvLabel(event: number): string {
  switch (event) {
    case KEY_EV.UP:
      return "UP";
    case KEY_EV.DOWN:
      return "DOWN";
    case KEY_EV.SHORT:
      return "SHORT";
    case KEY_EV.LONG:
      return "LONG";
    case KEY_EV.DOUBLE:
      return "DOUBLE";
    default:
      return `ev ${event}`;
  }
}
