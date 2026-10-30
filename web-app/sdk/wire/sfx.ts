import protobuf from "protobufjs";

/** Host → board: play / stop a sound preset. */
export const MSG_SFX_CMD = 0x84;
/** Host → board: live DSP knob. */
export const MSG_SFX_PARAM = 0x85;

export const SFX_PRESET = {
  CHIME: 0,
  ALARM: 1,
  BEEP: 2,
  USER: 3,
  BIRD: 4,
  BIRD_REV: 5,
  AMBULANCE: 6,
  FIRE: 7,
  POLICE: 8,
  ENGINE: 9,
  MOTOR: 10,
  STOP: 255,
} as const;

export type SfxPresetId = (typeof SFX_PRESET)[keyof typeof SFX_PRESET];

const SfxCmdType = new protobuf.Type("SfxCmd")
  .add(new protobuf.Field("preset", 1, "uint32"))
  .add(new protobuf.Field("volume", 2, "uint32"))
  .add(new protobuf.Field("loops", 3, "uint32"))
  .add(new protobuf.Field("dur_s", 4, "uint32"));

const SfxParamType = new protobuf.Type("SfxParam")
  .add(new protobuf.Field("stage", 1, "uint32"))
  .add(new protobuf.Field("field", 2, "uint32"))
  .add(new protobuf.Field("value", 3, "float"));

export type SfxPlayOpts = {
  volume?: number;
  loops?: number;
  durS?: number;
};

/** Encode `SfxCmd` — `volume` 0 = leave unchanged on the board. */
export function encodeSfxPlay(preset: number, opts: SfxPlayOpts = {}): Uint8Array {
  return SfxCmdType.encode(
    SfxCmdType.create({
      preset,
      volume: opts.volume ?? 0,
      loops: opts.loops ?? 0,
      dur_s: opts.durS ?? 0,
    }),
  ).finish();
}

export function encodeSfxStop(): Uint8Array {
  return encodeSfxPlay(SFX_PRESET.STOP);
}

/** DSP knob — stage 0xFF = master volume (field ignored). */
export function encodeSfxParam(stage: number, field: number, value: number): Uint8Array {
  return SfxParamType.encode(SfxParamType.create({ stage, field, value })).finish();
}
