export { decodeBoardInfo, type BoardInfoView } from "@/lib/wire/boardInfo";
export {
  MSG_BATTERY,
  decodeBatteryStatus,
  type BatteryStatusView,
} from "@/lib/wire/battery";
export { FrameDecoder, MSG_BOARD_INFO, frameEncode, type DecodedFrame } from "@/lib/wire/frame";
export {
  MSG_IMU,
  accelMagnitude,
  decodeImu,
  type ImuView,
  type Vec3,
} from "@/lib/wire/imu";
export {
  KEY_EV,
  MSG_KEY_EVENT,
  decodeKeyEvent,
  keyEvLabel,
  keyLabel,
  type KeyEventView,
  type KeyEvId,
} from "@/lib/wire/key";
export {
  LED_FX,
  LED_FX_PRESETS,
  LED_PRESETS,
  LED_STUDIO_COLORS,
  MSG_CMD_ACK,
  MSG_LED_CMD,
  MSG_LED_FX,
  MSG_LED_STATE,
  decodeCmdAck,
  decodeLedState,
  encodeLedBlink,
  encodeLedFade,
  encodeLedFx,
  encodeLedOff,
  encodeLedRainbow,
  encodeLedSolid,
  type CmdAckView,
  type LedFxEffect,
  type LedFxParams,
  type LedFxPreset,
  type LedFxPresetId,
  type Rgb,
} from "@/lib/wire/led";
export {
  MSG_AUDIO_LEVEL,
  MSG_MIC_CMD,
  MSG_MIC_PCM,
  decodeAudioLevel,
  decodeMicPcm,
  encodeMicCmd,
  VU_FLOOR_DB,
  levelToDb,
  levelToPercent,
  type AudioLevelView,
  type MicCmdParams,
  type MicPcmView,
} from "@/lib/wire/mic";
export {
  MSG_SFX_CMD,
  MSG_SFX_PARAM,
  MSG_SFX_PROG,
  SFX_CHIRP_PRESETS,
  SFX_DEMO_MELODY,
  SFX_MACHINE_PRESETS,
  SFX_PLAY_PRESETS,
  SFX_PRESET,
  SFX_SIREN_PRESETS,
  SFX_SHAPE,
  encodeSfxParam,
  encodeSfxPlay,
  encodeSfxProg,
  encodeSfxStop,
  type SfxPlayOpts,
  type SfxPresetId,
  type SfxPresetInfo,
  type SfxStep,
} from "@/lib/wire/sfx";
export { MSG_TIME_SYNC, encodeTimeSync } from "@/lib/wire/time";
export { wireSelfCheck } from "@/lib/wire/selfcheck";
