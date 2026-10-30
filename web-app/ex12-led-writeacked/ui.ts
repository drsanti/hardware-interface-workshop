/**
 * Page widgets only — no BoardSession / LED encode here.
 * Students: prefer reading main.ts.
 */

function requireEl<T extends HTMLElement>(id: string, kind: new () => T): T {
  const el = document.getElementById(id);
  if (!(el instanceof kind)) {
    throw new Error(`ex12: missing #${id} in index.html`);
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
  ledRed: requireEl("led-red", HTMLButtonElement),
  ledGreen: requireEl("led-green", HTMLButtonElement),
  ledBlink: requireEl("led-blink", HTMLButtonElement),
  ledOff: requireEl("led-off", HTMLButtonElement),
  swatch: requireEl("swatch", HTMLSpanElement),
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

export function setLedButtons(enabled: boolean): void {
  ui.ledRed.disabled = !enabled;
  ui.ledGreen.disabled = !enabled;
  ui.ledBlink.disabled = !enabled;
  ui.ledOff.disabled = !enabled;
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

export function setSwatch(rgb: { r: number; g: number; b: number } | null): void {
  if (!rgb) {
    ui.swatch.style.background = "transparent";
    return;
  }
  ui.swatch.style.background = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}
