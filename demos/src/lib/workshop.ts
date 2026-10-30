/** Capability bits from board `BoardInfo.caps` / `bsp_caps()`. */
export const CAP = {
  LED: 0x01,
  MIC: 0x02,
  IMU: 0x04,
  RTC: 0x08,
  BATT: 0x10,
  BTN: 0x20,
} as const;

export type WorkshopBoardId = "es3c28p" | "ws28p";

export type BoardFeatureId = "led" | "mic" | "imu" | "rtc" | "batt" | "audio";

export type BoardFeature = {
  id: BoardFeatureId;
  label: string;
  detail: string;
};

export type WorkshopBoard = {
  id: WorkshopBoardId;
  caps: number;
  /** Short phrase for titles / headers. */
  blurb: string;
  /** Prebuilt flash folder under workshop `firmware-prebuilt/` (sibling of demos/). */
  prebuiltDir: string;
  features: readonly BoardFeature[];
};

/**
 * Supported boards. Flash the matching folder under `firmware-prebuilt/`.
 * Gate lab UI with `caps` / `boardHas()` — do not assume LED or mic.
 */
export const BOARDS: Record<WorkshopBoardId, WorkshopBoard> = {
  es3c28p: {
    id: "es3c28p",
    caps: 0x33, // LED | MIC | BATT | BTN
    blurb: "RGB LED + MEMS mic",
    prebuiltDir: "firmware-prebuilt/es3c28p/",
    features: [
      { id: "led", label: "RGB LED", detail: "color, solid, blink" },
      { id: "mic", label: "Microphone", detail: "level + audio over USB" },
      { id: "audio", label: "Speaker", detail: "tones and sound effects" },
    ],
  },
  ws28p: {
    id: "ws28p",
    caps: 0x3c, // IMU | RTC | BATT | BTN — no LED, no mic
    blurb: "IMU + RTC (no RGB LED / mic)",
    prebuiltDir: "firmware-prebuilt/ws28p/",
    features: [
      { id: "imu", label: "Motion sensor", detail: "acceleration + rotation" },
      { id: "rtc", label: "Clock", detail: "keeps time on the board" },
      { id: "batt", label: "Battery", detail: "voltage reading" },
    ],
  },
};

/*
 * Enable exactly one board target: uncomment one line, comment the other.
 * Same idea as switching examples in App.tsx.
 */
export const WORKSHOP_BOARD_ID: WorkshopBoardId = "es3c28p";
// export const WORKSHOP_BOARD_ID: WorkshopBoardId = "ws28p";

export const WORKSHOP_BOARD = BOARDS[WORKSHOP_BOARD_ID];
export const WORKSHOP_CAPS = WORKSHOP_BOARD.caps;

export function boardHas(cap: number, caps: number = WORKSHOP_CAPS): boolean {
  return (caps & cap) !== 0;
}
