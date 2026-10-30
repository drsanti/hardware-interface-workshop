/**
 * Page widgets only — Web Audio speaker logic stays in main.ts.
 * Students: prefer reading main.ts.
 */

function requireEl<T extends Element>(id: string, kind: abstract new (...args: never[]) => T): T {
  const el = document.getElementById(id);
  if (!(el instanceof kind)) {
    throw new Error(`ex08: missing #${id} in index.html`);
  }
  return el;
}

export const ui = {
  play: requireEl("play", HTMLButtonElement),
  stop: requireEl("stop", HTMLButtonElement),
  freq: requireEl("freq", HTMLInputElement),
  gain: requireEl("gain", HTMLInputElement),
  freqLabel: requireEl("freq-label", HTMLSpanElement),
  gainLabel: requireEl("gain-label", HTMLSpanElement),
  readout: requireEl("readout", HTMLParagraphElement),
};

export function setButtons(opts: { play: boolean; stop: boolean }): void {
  ui.play.disabled = !opts.play;
  ui.stop.disabled = !opts.stop;
}

export function setSliderLabels(freqHz: number, gain: number): void {
  ui.freqLabel.textContent = `${freqHz} Hz`;
  ui.gainLabel.textContent = gain.toFixed(2);
}

export function setReadout(text: string): void {
  ui.readout.textContent = text;
}
