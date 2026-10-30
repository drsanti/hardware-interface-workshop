import protobuf from "protobufjs";

/** Board → host: pack voltage @ ~10 s. */
export const MSG_BATTERY = 0x25;

export type BatteryStatusView = {
  mv: number;
  pct: number;
};

const BatteryStatusType = new protobuf.Type("BatteryStatus")
  .add(new protobuf.Field("mv", 1, "uint32"))
  .add(new protobuf.Field("pct", 2, "uint32"));

export function decodeBatteryStatus(payload: Uint8Array): BatteryStatusView {
  const msg = BatteryStatusType.toObject(BatteryStatusType.decode(payload), {
    defaults: true,
  }) as { mv?: number; pct?: number };
  return {
    mv: Number(msg.mv ?? 0),
    pct: Math.max(0, Math.min(100, Number(msg.pct ?? 0))),
  };
}
