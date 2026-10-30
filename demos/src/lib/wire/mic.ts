import protobuf from "protobufjs";

/** Host → board: mic capture control. */
export const MSG_MIC_CMD = 0x86;
/** Board → host: level window ~10 Hz while mic enabled. */
export const MSG_AUDIO_LEVEL = 0x23;
/** Board → host: PCM chunks when `MicCmd.stream` is on. */
export const MSG_MIC_PCM = 0x24;

export type AudioLevelView = {
  rms: number;
  peak: number;
  frames: number;
  clipped: boolean;
};

export type MicPcmView = {
  seq: number;
  samples: Int16Array;
};

export type MicCmdParams = {
  enable?: boolean;
  gainPct?: number;
  stream?: boolean;
  mute?: boolean;
  stageMask?: number;
};

const MicCmdType = new protobuf.Type("MicCmd")
  .add(new protobuf.Field("enable", 1, "bool", "optional"))
  .add(new protobuf.Field("gain_pct", 2, "uint32", "optional"))
  .add(new protobuf.Field("stream", 3, "bool", "optional"))
  .add(new protobuf.Field("stage_mask", 4, "uint32", "optional"))
  .add(new protobuf.Field("mute", 5, "bool", "optional"));

const AudioLevelType = new protobuf.Type("AudioLevel")
  .add(new protobuf.Field("rms", 1, "uint32"))
  .add(new protobuf.Field("peak", 2, "uint32"))
  .add(new protobuf.Field("frames", 3, "uint32"))
  .add(new protobuf.Field("clipped", 4, "bool"));

const MicPcmType = new protobuf.Type("MicPcm")
  .add(new protobuf.Field("seq", 1, "uint32"))
  .add(new protobuf.Field("samples", 2, "sint32", "repeated"));

/** Encode `MicCmd` — omit fields you do not want to change. */
export function encodeMicCmd(params: MicCmdParams): Uint8Array {
  const msg: Record<string, unknown> = {};
  if (params.enable !== undefined) msg.enable = params.enable;
  if (params.gainPct !== undefined) {
    msg.gain_pct = Math.max(0, Math.min(100, Math.round(params.gainPct)));
  }
  if (params.stream !== undefined) msg.stream = params.stream;
  if (params.mute !== undefined) msg.mute = params.mute;
  if (params.stageMask !== undefined) msg.stage_mask = params.stageMask;
  return MicCmdType.encode(MicCmdType.create(msg)).finish();
}

export function decodeAudioLevel(payload: Uint8Array): AudioLevelView {
  const msg = AudioLevelType.toObject(AudioLevelType.decode(payload), {
    defaults: true,
  }) as {
    rms?: number;
    peak?: number;
    frames?: number;
    clipped?: boolean;
  };
  return {
    rms: Number(msg.rms ?? 0),
    peak: Number(msg.peak ?? 0),
    frames: Number(msg.frames ?? 0),
    clipped: Boolean(msg.clipped),
  };
}

export function decodeMicPcm(payload: Uint8Array): MicPcmView {
  const msg = MicPcmType.toObject(MicPcmType.decode(payload), {
    defaults: true,
  }) as { seq?: number; samples?: number[] };
  const raw = msg.samples ?? [];
  const samples = new Int16Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    const v = Number(raw[i] ?? 0);
    samples[i] = Math.max(-32768, Math.min(32767, v));
  }
  return { seq: Number(msg.seq ?? 0), samples };
}

/**
 * Map int16 amplitude (0..32767) to a VU percent.
 *
 * Linear /32767 makes normal speech sit near ~15–25% (far from clip).
 * Match the board `rb_vu` DBFS path: floor_db..0 dBFS → 0..100.
 */
export const VU_FLOOR_DB = -48;

/** Amplitude 0..32767 → dBFS (0 = full scale). */
export function levelToDb(level: number): number {
  if (level <= 0) return Number.NEGATIVE_INFINITY;
  return 20 * Math.log10(level / 32767);
}

export function levelToPercent(level: number, floorDb: number = VU_FLOOR_DB): number {
  if (level <= 0) return 0;
  const db = levelToDb(level);
  if (!Number.isFinite(db) || db <= floorDb) return 0;
  if (db >= 0) return 100;
  return Math.max(0, Math.min(100, ((db - floorDb) / -floorDb) * 100));
}
