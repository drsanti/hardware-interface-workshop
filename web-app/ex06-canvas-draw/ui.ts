/**
 * Page widgets only — canvas drawing stays in main.ts.
 * Students: prefer reading main.ts.
 */

function requireEl<T extends Element>(id: string, kind: abstract new (...args: never[]) => T): T {
  const el = document.getElementById(id);
  if (!(el instanceof kind)) {
    throw new Error(`ex06: missing #${id} in index.html`);
  }
  return el;
}

export const ui = {
  clear: requireEl("clear", HTMLButtonElement),
  wrap: requireEl("wrap", HTMLDivElement),
  pad: requireEl("pad", HTMLCanvasElement),
  readout: requireEl("readout", HTMLParagraphElement),
  swatches: [...document.querySelectorAll<HTMLButtonElement>(".color-swatch")],
};

export function setReadout(text: string): void {
  ui.readout.textContent = text;
}

export function setPressedSwatch(active: HTMLButtonElement): void {
  for (const sw of ui.swatches) {
    sw.setAttribute("aria-pressed", sw === active ? "true" : "false");
  }
}
