/**
 * Page widgets only — camera stream logic stays in main.ts.
 * Students: prefer reading main.ts.
 */

function requireEl<T extends Element>(id: string, kind: abstract new (...args: never[]) => T): T {
  const el = document.getElementById(id);
  if (!(el instanceof kind)) {
    throw new Error(`ex09: missing #${id} in index.html`);
  }
  return el;
}

export const ui = {
  start: requireEl("start", HTMLButtonElement),
  stop: requireEl("stop", HTMLButtonElement),
  wrap: requireEl("preview-wrap", HTMLDivElement),
  video: requireEl("preview", HTMLVideoElement),
  readout: requireEl("readout", HTMLParagraphElement),
};

export function setButtons(opts: { start: boolean; stop: boolean }): void {
  ui.start.disabled = !opts.start;
  ui.stop.disabled = !opts.stop;
}

export function setLive(live: boolean): void {
  ui.wrap.classList.toggle("is-live", live);
}

export function setReadout(text: string): void {
  ui.readout.textContent = text;
}
