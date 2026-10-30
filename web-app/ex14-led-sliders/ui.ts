/**
 * Page widgets only — no BoardSession / encode here.
 * Students: prefer reading main.ts.
 */

function requireEl<T extends HTMLElement>(id: string, kind: new () => T): T {
  const el = document.getElementById(id);
  if (!(el instanceof kind)) {
    throw new Error(`ex14: missing #${id} in index.html`);
  }
  return el;
}

export const ui = {
  hint: requireEl("hint", HTMLParagraphElement),
  banner: requireEl("banner", HTMLParagraphElement),
  connectSerial: requireEl("connect-serial", HTMLButtonElement),
  connectBle: requireEl("connect-ble", HTMLButtonElement),
  disconnect: requireEl("disconnect", HTMLButtonElement),
  status: requireEl("status", HTMLPreElement),
  info: requireEl("info", HTMLPreElement),
  r: requireEl("r", HTMLInputElement),
  g: requireEl("g", HTMLInputElement),
  b: requireEl("b", HTMLInputElement),
  intensity: requireEl("intensity", HTMLInputElement),
  rVal: requireEl("r-val", HTMLSpanElement),
  gVal: requireEl("g-val", HTMLSpanElement),
  bVal: requireEl("b-val", HTMLSpanElement),
  intensityVal: requireEl("intensity-val", HTMLSpanElement),
  live: requireEl("live", HTMLInputElement),
  apply: requireEl("apply", HTMLButtonElement),
  off: requireEl("off", HTMLButtonElement),
  swatch: requireEl("swatch", HTMLSpanElement),
  preview: requireEl("preview", HTMLPreElement),
  ack: requireEl("ack", HTMLPreElement),
};

export function setHint(text: string): void {
  ui.hint.textContent = text;
}

export function setBanner(message: string | null): void {
  if (message) {
    ui.banner.hidden = false;
    ui.banner.textContent = message;
  } else {
    ui.banner.hidden = true;
    ui.banner.textContent = "";
  }
}

export function setLinkButtons(opts: {
  serial: boolean;
  ble: boolean;
  disconnect: boolean;
}): void {
  ui.connectSerial.disabled = !opts.serial;
  ui.connectBle.disabled = !opts.ble;
  ui.disconnect.disabled = !opts.disconnect;
}

export function setMixEnabled(enabled: boolean): void {
  ui.r.disabled = !enabled;
  ui.g.disabled = !enabled;
  ui.b.disabled = !enabled;
  ui.intensity.disabled = !enabled;
  ui.live.disabled = !enabled;
  ui.apply.disabled = !enabled;
  ui.off.disabled = !enabled;
}

export function setStatusText(text: string): void {
  ui.status.textContent = text;
}

export function setInfoText(text: string): void {
  ui.info.textContent = text;
}

export function setAckText(text: string): void {
  ui.ack.textContent = text;
}

export function setPreview(
  base: { r: number; g: number; b: number },
  out: { r: number; g: number; b: number },
  intensity: number,
): void {
  ui.rVal.textContent = String(base.r);
  ui.gVal.textContent = String(base.g);
  ui.bVal.textContent = String(base.b);
  ui.intensityVal.textContent = String(intensity);
  ui.swatch.style.background = `rgb(${out.r}, ${out.g}, ${out.b})`;
  ui.preview.textContent = `r=${base.r} g=${base.g} b=${base.b} i=${intensity}\nout=${out.r},${out.g},${out.b}`;
}
