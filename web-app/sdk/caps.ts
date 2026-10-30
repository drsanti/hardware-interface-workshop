/** Capability bits from board `BoardInfo.caps` / `bsp_caps()`. */
export const CAP = {
  LED: 0x01,
  MIC: 0x02,
  IMU: 0x04,
  RTC: 0x08,
  BATT: 0x10,
  BTN: 0x20,
} as const;

export type CapId = (typeof CAP)[keyof typeof CAP];

export function boardHas(cap: number, caps: number): boolean {
  return (caps & cap) !== 0;
}

export function featureLabels(caps: number): string[] {
  const labels: string[] = [];
  if (caps & CAP.LED) labels.push("RGB LED");
  if (caps & CAP.MIC) labels.push("Microphone");
  if (caps & CAP.IMU) labels.push("Motion sensor");
  if (caps & CAP.RTC) labels.push("Clock");
  if (caps & CAP.BATT) labels.push("Battery");
  if (caps & CAP.BTN) labels.push("Buttons");
  return labels;
}
