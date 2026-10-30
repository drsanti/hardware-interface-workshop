import protobuf from "protobufjs";

/** WaveCmd — host → MCU per-channel LED oscillator (`0x83`). */
export const MSG_CMD_WAVE = 0x83;

/** `WaveCmd.shape` — match firmware `rb_wave_shape_t`. */
export const WAVE_SHAPE = {
  SIN: 0,
  SQUARE: 1,
  TRIANGLE: 2,
  SAWTOOTH: 3,
} as const;

export type WaveShapeId = (typeof WAVE_SHAPE)[keyof typeof WAVE_SHAPE];

export type WaveCmdParams = {
  /** Channel 0=R, 1=G, 2=B; `255` = all three. */
  channel: number;
  shape: WaveShapeId;
  /** `0` = free-run; `>0` = burst that many cycles. */
  cycles?: number;
  freqHz?: number;
  amplitude?: number;
  offset?: number;
  phaseDeg?: number;
  enable?: boolean;
  /** Square only — on-time percent 1..99. */
  dutyPct?: number;
};

const WaveCmdType = new protobuf.Type("WaveCmd")
  .add(new protobuf.Field("channel", 1, "uint32"))
  .add(new protobuf.Field("shape", 2, "uint32"))
  .add(new protobuf.Field("cycles", 3, "uint32"))
  .add(new protobuf.Field("freq_hz", 4, "float"))
  .add(new protobuf.Field("amplitude", 5, "float"))
  .add(new protobuf.Field("offset", 6, "float"))
  .add(new protobuf.Field("phase_deg", 7, "float"))
  .add(new protobuf.Field("enable", 8, "bool"))
  .add(new protobuf.Field("duty_pct", 9, "uint32", "optional"));

/** Encode one `WaveCmd` payload. */
export function encodeWaveCmd(params: WaveCmdParams): Uint8Array {
  const msg: Record<string, unknown> = {
    channel: params.channel >>> 0,
    shape: params.shape >>> 0,
    cycles: (params.cycles ?? 0) >>> 0,
    freq_hz: params.freqHz ?? 0.25,
    amplitude: params.amplitude ?? 0.5,
    offset: params.offset ?? 0.5,
    phase_deg: params.phaseDeg ?? 0,
    enable: params.enable ?? true,
  };
  if (params.dutyPct !== undefined) {
    msg.duty_pct = params.dutyPct >>> 0;
  }
  return WaveCmdType.encode(WaveCmdType.create(msg)).finish();
}

/** Stop wave(s) — `channel` `255` = all RGB. */
export function encodeWaveStop(channel = 255): Uint8Array {
  return encodeWaveCmd({
    channel,
    shape: WAVE_SHAPE.SIN,
    enable: false,
  });
}

/**
 * Boot-style RGB color wheel: three sine waves, harmonic freqs,
 * 120° phase spacing (matches firmware `app_led_init` demo).
 */
export function encodeWaveColorWheel(): Uint8Array[] {
  return [0, 1, 2].map((ch) =>
    encodeWaveCmd({
      channel: ch,
      shape: WAVE_SHAPE.SIN,
      cycles: 0,
      freqHz: 0.25 * (ch + 1),
      amplitude: 0.5,
      offset: 0.5,
      phaseDeg: ch * 120,
      enable: true,
    }),
  );
}

/** Same shape/freq on all three channels (`channel = 255`). */
export function encodeWaveAll(
  shape: WaveShapeId,
  freqHz = 0.5,
  opts?: { dutyPct?: number },
): Uint8Array {
  return encodeWaveCmd({
    channel: 255,
    shape,
    cycles: 0,
    freqHz,
    amplitude: 0.5,
    offset: 0.5,
    phaseDeg: 0,
    enable: true,
    dutyPct: opts?.dutyPct,
  });
}
