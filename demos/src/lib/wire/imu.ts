import protobuf from "protobufjs";

/**
 * Board → host @ ~50 Hz on ws28p.
 * Wire schema is `robotos.sensor.v1.Imu` (not legacy ImuSample floats).
 */
export const MSG_IMU = 0x20;

export type Vec3 = { x: number; y: number; z: number };

export type ImuView = {
  timestampNs: number;
  accel: Vec3;
  gyro: Vec3;
};

const root = new protobuf.Root();
const ns = root.define("robotos.sensor.v1");

const Vector3Type = new protobuf.Type("Vector3")
  .add(new protobuf.Field("x", 1, "double"))
  .add(new protobuf.Field("y", 2, "double"))
  .add(new protobuf.Field("z", 3, "double"));

const ImuType = new protobuf.Type("Imu")
  .add(new protobuf.Field("timestamp_ns", 1, "uint64"))
  .add(new protobuf.Field("frame_id", 2, "string"))
  .add(new protobuf.Field("acceleration", 3, "Vector3"))
  .add(new protobuf.Field("angular_velocity", 4, "Vector3"));

ns.add(Vector3Type);
ns.add(ImuType);

function asVec(v: { x?: number; y?: number; z?: number } | undefined): Vec3 {
  return {
    x: Number(v?.x ?? 0),
    y: Number(v?.y ?? 0),
    z: Number(v?.z ?? 0),
  };
}

export function decodeImu(payload: Uint8Array): ImuView {
  const msg = ImuType.toObject(ImuType.decode(payload), {
    longs: Number,
    defaults: true,
  }) as {
    timestamp_ns?: number;
    acceleration?: { x?: number; y?: number; z?: number };
    angular_velocity?: { x?: number; y?: number; z?: number };
  };
  return {
    timestampNs: Number(msg.timestamp_ns ?? 0),
    accel: asVec(msg.acceleration),
    gyro: asVec(msg.angular_velocity),
  };
}

/** |a| magnitude in m/s² (gravity ~9.8 at rest). */
export function accelMagnitude(a: Vec3): number {
  return Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
}
