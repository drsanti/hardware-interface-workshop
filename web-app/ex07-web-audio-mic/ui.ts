/**
 * Page widgets only — Web Audio mic logic stays in main.ts.
 * Students: prefer reading main.ts.
 */

function requireEl<T extends Element>(id: string, kind: abstract new (...args: never[]) => T): T {
  const el = document.getElementById(id);
  if (!(el instanceof kind)) {
    throw new Error(`ex07: missing #${id} in index.html`);
  }
  return el;
}

export const ui = {
  start: requireEl("start", HTMLButtonElement),
  stop: requireEl("stop", HTMLButtonElement),
  meterTrack: requireEl("meter-track", HTMLDivElement),
  meterFill: requireEl("meter-fill", HTMLDivElement),
  readout: requireEl("readout", HTMLParagraphElement),
};

export function setLevel(pct: number): void {
  const clamped = Math.max(0, Math.min(100, pct));
  ui.meterFill.style.width = `${clamped.toFixed(1)}%`;
  ui.meterTrack.setAttribute("aria-valuenow", String(Math.round(clamped)));
}

export function setButtons(opts: { start: boolean; stop: boolean }): void {
  ui.start.disabled = !opts.start;
  ui.stop.disabled = !opts.stop;
}

export function setReadout(text: string): void {
  ui.readout.textContent = text;
}
