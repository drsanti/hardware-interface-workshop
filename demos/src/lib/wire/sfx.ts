import protobuf from "protobufjs";

/** Host → board: play / stop a sound preset. */
export const MSG_SFX_CMD = 0x84;
/** Host → board: live DSP knob. */
export const MSG_SFX_PARAM = 0x85;
/** Host → board: upload user melody into preset slot 3. */
export const MSG_SFX_PROG = 0x8d;

/** Built-in wire presets (`app_audio.c`). */
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

export type SfxPresetInfo = {
  id: number;
  label: string;
  detail: string;
};

/** Core pads (excludes user slot — that needs SfxProg). */
export const SFX_PLAY_PRESETS: SfxPresetInfo[] = [
  { id: SFX_PRESET.CHIME, label: "Chime", detail: "Boot melody" },
  { id: SFX_PRESET.ALARM, label: "Alarm", detail: "Looping alert" },
  { id: SFX_PRESET.BEEP, label: "Beep", detail: "Single tone" },
];

/** Matched A/B pair — same five pitches, opposite order. */
export const SFX_CHIRP_PRESETS: SfxPresetInfo[] = [
  { id: SFX_PRESET.BIRD, label: "Chirp ↑", detail: "Low → high" },
  { id: SFX_PRESET.BIRD_REV, label: "Chirp ↓", detail: "High → low" },
];

/** Sirens — loop until Stop. */
export const SFX_SIREN_PRESETS: SfxPresetInfo[] = [
  { id: SFX_PRESET.AMBULANCE, label: "Ambulance", detail: "Slow hi–lo" },
  { id: SFX_PRESET.FIRE, label: "Fire truck", detail: "Rising whoop" },
  { id: SFX_PRESET.POLICE, label: "Police", detail: "Fast yelp" },
];

/** Machines — loop until Stop. */
export const SFX_MACHINE_PRESETS: SfxPresetInfo[] = [
  { id: SFX_PRESET.ENGINE, label: "Engine", detail: "Car idle rumble" },
  { id: SFX_PRESET.MOTOR, label: "Motor", detail: "Scooter buzz" },
];

/** Wave shapes for SfxStep (match firmware `rb_wave_shape_t`). */
export const SFX_SHAPE = {
  SIN: 0,
  SQUARE: 1,
  TRIANGLE: 2,
  SAWTOOTH: 3,
} as const;

export type SfxStep = {
  freqHz: number;
  shape: number;
  durMs: number;
};

/**
 * Demo melody for user slot 3 — deliberately NOT the Chime pattern
 * so Upload → Play user slot is easy to tell apart from the Chime pad.
 * (Short “door chime” style: low bump then bright ping.)
 */
export const SFX_DEMO_MELODY: SfxStep[] = [
  { freqHz: 330, shape: SFX_SHAPE.SIN, durMs: 220 },
  { freqHz: 0, shape: 0, durMs: 80 },
  { freqHz: 880, shape: SFX_SHAPE.TRIANGLE, durMs: 180 },
  { freqHz: 1320, shape: SFX_SHAPE.TRIANGLE, durMs: 280 },
  { freqHz: 0, shape: 0, durMs: 100 },
  { freqHz: 990, shape: SFX_SHAPE.SIN, durMs: 400 },
];

const SfxCmdType = new protobuf.Type("SfxCmd")
  .add(new protobuf.Field("preset", 1, "uint32"))
  .add(new protobuf.Field("volume", 2, "uint32"))
  .add(new protobuf.Field("loops", 3, "uint32"))
  .add(new protobuf.Field("dur_s", 4, "uint32"));

const SfxParamType = new protobuf.Type("SfxParam")
  .add(new protobuf.Field("stage", 1, "uint32"))
  .add(new protobuf.Field("field", 2, "uint32"))
  .add(new protobuf.Field("value", 3, "float"));

const SfxStepType = new protobuf.Type("SfxStep")
  .add(new protobuf.Field("freq_hz", 1, "uint32"))
  .add(new protobuf.Field("shape", 2, "uint32"))
  .add(new protobuf.Field("dur_ms", 3, "uint32"));

const SfxProgType = new protobuf.Type("SfxProg");
SfxProgType.add(SfxStepType);
SfxProgType.add(new protobuf.Field("steps", 1, "SfxStep", "repeated"));
SfxProgType.add(new protobuf.Field("name", 2, "string", "optional"));

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
  return SfxParamType.encode(
    SfxParamType.create({ stage, field, value }),
  ).finish();
}

export function encodeSfxProg(steps: SfxStep[], name = "workshop"): Uint8Array {
  return SfxProgType.encode(
    SfxProgType.create({
      steps: steps.map((s) => ({
        freq_hz: s.freqHz,
        shape: s.shape,
        dur_ms: s.durMs,
      })),
      name,
    }),
  ).finish();
}
