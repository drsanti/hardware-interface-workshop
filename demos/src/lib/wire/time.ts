import protobuf from "protobufjs";

/** Host → board: stamp the soft clock (and RTC on ws28p). */
export const MSG_TIME_SYNC = 0x8b;

const TimeSyncType = new protobuf.Type("TimeSync").add(
  new protobuf.Field("unix_ns", 1, "uint64"),
);

/** Encode TimeSync — `unixNs` is Unix epoch nanoseconds. */
export function encodeTimeSync(unixNs: number | bigint = Date.now() * 1e6): Uint8Array {
  return TimeSyncType.encode(
    TimeSyncType.create({ unix_ns: unixNs }),
  ).finish();
}
