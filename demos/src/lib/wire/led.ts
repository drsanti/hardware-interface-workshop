import protobuf from "protobufjs";

/** Host → board: raw LED on/off + rgb (legacy). Prefer LedFx. */
export const MSG_LED_CMD = 0x80;
/** Host → board: semantic LED effect (solid / off / blink / …). */
export const MSG_LED_FX = 0x8e;
/** Board → host: last commanded LED color. */
export const MSG_LED_STATE = 0x21;
/** Board → host: command result. */
export const MSG_CMD_ACK = 0x27;

export type Rgb = { r: number; g: number; b: number };

export type CmdAckView = {
  msgType: number;
  reqSeq: number;
  rc: number;
};

const LedFxType = new protobuf.Type("LedFx")
  .add(new protobuf.Field("effect", 1, "uint32"))
  .add(new protobuf.Field("r", 2, "uint32"))
  .add(new protobuf.Field("g", 3, "uint32"))
  .add(new protobuf.Field("b", 4, "uint32"))
  .add(new protobuf.Field("n", 5, "uint32"))
  .add(new protobuf.Field("delay_ms", 6, "uint32"))
  .add(new protobuf.Field("on_ms", 7, "uint32"))
  .add(new protobuf.Field("off_ms", 8, "uint32"))
  .add(new protobuf.Field("end_ms", 9, "uint32"))
  .add(new protobuf.Field("intensity", 10, "uint32"));

const LedStateType = new protobuf.Type("LedState")
  .add(new protobuf.Field("r", 1, "uint32"))
  .add(new protobuf.Field("g", 2, "uint32"))
  .add(new protobuf.Field("b", 3, "uint32"));

const CmdAckType = new protobuf.Type("CmdAck")
  .add(new protobuf.Field("msg_type", 1, "uint32"))
  .add(new protobuf.Field("req_seq", 2, "uint64"))
  .add(new protobuf.Field("rc", 3, "int32"))
  .add(new protobuf.Field("detail", 4, "string"));

function clampByte(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}

/** `LedFx.effect` values (match firmware `rb_fx_led_effect_t`). */
export const LED_FX = {
  OFF: 0,
  SOLID: 1,
  BLINK: 2,
  FADE: 3,
  RAINBOW: 4,
} as const;

export type LedFxEffect = (typeof LED_FX)[keyof typeof LED_FX];

export type LedFxParams = {
  effect: LedFxEffect;
  rgb?: Rgb;
  /** Cycles; `0` = free-run where the board supports it. */
  n?: number;
  delayMs?: number;
  onMs?: number;
  offMs?: number;
  endMs?: number;
  intensity?: number;
};

/** Encode any semantic LED effect (`msg_type` 0x8e). */
export function encodeLedFx(params: LedFxParams): Uint8Array {
  const rgb = params.rgb ?? { r: 0, g: 0, b: 0 };
  return LedFxType.encode(
    LedFxType.create({
      effect: params.effect,
      r: clampByte(rgb.r),
      g: clampByte(rgb.g),
      b: clampByte(rgb.b),
      n: params.n ?? 0,
      delay_ms: params.delayMs ?? 0,
      on_ms: params.onMs ?? 0,
      off_ms: params.offMs ?? 0,
      end_ms: params.endMs ?? 0,
      intensity: clampByte(params.intensity ?? 255),
    }),
  ).finish();
}

/** Solid color — same path the official web SDK uses (`LedFx` effect=1). */
export function encodeLedSolid(rgb: Rgb): Uint8Array {
  return encodeLedFx({ effect: LED_FX.SOLID, rgb });
}

/** Turn LED off (`LedFx` effect=0). */
export function encodeLedOff(): Uint8Array {
  return encodeLedFx({ effect: LED_FX.OFF });
}

/** Blink using the current RGB (free-run). */
export function encodeLedBlink(rgb: Rgb, onMs = 200, offMs = 200): Uint8Array {
  return encodeLedFx({
    effect: LED_FX.BLINK,
    rgb,
    n: 0,
    onMs,
    offMs,
  });
}

/** Fade in/out using the current RGB (free-run). */
export function encodeLedFade(rgb: Rgb, onMs = 500, offMs = 500): Uint8Array {
  return encodeLedFx({
    effect: LED_FX.FADE,
    rgb,
    n: 0,
    onMs,
    offMs,
  });
}

/** Free-run rainbow (period ≈ on+off+end; board defaults if zero). */
export function encodeLedRainbow(periodMs = 1200): Uint8Array {
  const half = Math.max(1, Math.floor(periodMs / 2));
  return encodeLedFx({
    effect: LED_FX.RAINBOW,
    onMs: half,
    offMs: half,
  });
}

/** Decode the board’s LED shadow state. */
export function decodeLedState(payload: Uint8Array): Rgb {
  const msg = LedStateType.toObject(LedStateType.decode(payload), {
    defaults: true,
  }) as { r?: number; g?: number; b?: number };
  return {
    r: Number(msg.r ?? 0),
    g: Number(msg.g ?? 0),
    b: Number(msg.b ?? 0),
  };
}

/** Decode command acknowledgement. */
export function decodeCmdAck(payload: Uint8Array): CmdAckView {
  const msg = CmdAckType.toObject(CmdAckType.decode(payload), {
    longs: Number,
    defaults: true,
  }) as { msg_type?: number; req_seq?: number; rc?: number };
  return {
    msgType: Number(msg.msg_type ?? 0),
    reqSeq: Number(msg.req_seq ?? 0),
    rc: Number(msg.rc ?? 0),
  };
}

export const LED_PRESETS: Array<{ id: string; label: string; rgb: Rgb }> = [
  { id: "red", label: "Red", rgb: { r: 255, g: 0, b: 0 } },
  { id: "green", label: "Green", rgb: { r: 0, g: 255, b: 0 } },
  { id: "blue", label: "Blue", rgb: { r: 0, g: 0, b: 255 } },
  { id: "white", label: "White", rgb: { r: 255, g: 255, b: 255 } },
];

/** Extra solid swatches for the LED studio lab. */
export const LED_STUDIO_COLORS: Array<{ id: string; label: string; rgb: Rgb }> = [
  ...LED_PRESETS,
  { id: "cyan", label: "Cyan", rgb: { r: 0, g: 220, b: 255 } },
  { id: "magenta", label: "Magenta", rgb: { r: 255, g: 0, b: 200 } },
  { id: "amber", label: "Amber", rgb: { r: 255, g: 160, b: 0 } },
  { id: "violet", label: "Violet", rgb: { r: 140, g: 0, b: 255 } },
];

export type LedFxPresetId = "blink" | "fade" | "rainbow";

export type LedFxPreset = {
  id: LedFxPresetId;
  label: string;
  detail: string;
  /** Build payload from the current slider RGB (ignored for rainbow). */
  encode: (rgb: Rgb) => Uint8Array;
};

/** Motion / pattern presets (still `LedFx`, not raw `LedCmd`). */
export const LED_FX_PRESETS: LedFxPreset[] = [
  {
    id: "blink",
    label: "Blink",
    detail: "On/off pulse",
    encode: (rgb) => encodeLedBlink(rgb),
  },
  {
    id: "fade",
    label: "Fade",
    detail: "Breathe in/out",
    encode: (rgb) => encodeLedFade(rgb),
  },
  {
    id: "rainbow",
    label: "Rainbow",
    detail: "Hue cycle",
    encode: () => encodeLedRainbow(1200),
  },
];
