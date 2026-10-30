/**
 * Page widgets only — polyline creation stays in main.ts.
 * Students: prefer reading main.ts.
 */

function requireEl<T extends Element>(id: string, kind: abstract new (...args: never[]) => T): T {
  const el = document.getElementById(id);
  if (!(el instanceof kind)) {
    throw new Error(`ex05: missing #${id} in index.html`);
  }
  return el;
}

export const ui = {
  clear: requireEl("clear", HTMLButtonElement),
  pad: requireEl("pad", SVGSVGElement),
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

export function clearPolylines(): void {
  for (const el of [...ui.pad.querySelectorAll("polyline")]) {
    el.remove();
  }
}
