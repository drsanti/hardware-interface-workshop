/** Page widgets only — students: prefer reading main.ts. */

function requireEl<T extends HTMLElement>(id: string, kind: new () => T): T {
  const el = document.getElementById(id);
  if (!(el instanceof kind)) {
    throw new Error(`ex17: missing #${id} in index.html`);
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
  sfxAlarm: requireEl("sfx-alarm", HTMLButtonElement),
  sfxAmbulance: requireEl("sfx-ambulance", HTMLButtonElement),
  sfxStop: requireEl("sfx-stop", HTMLButtonElement),
  master: requireEl("master", HTMLInputElement),
  echo: requireEl("echo", HTMLInputElement),
  release: requireEl("release", HTMLInputElement),
  masterVal: requireEl("master-val", HTMLSpanElement),
  echoVal: requireEl("echo-val", HTMLSpanElement),
  releaseVal: requireEl("release-val", HTMLSpanElement),
  ack: requireEl("ack", HTMLPreElement),
};

export function setHint(text: string): void {
  ui.hint.textContent = text;
}

export function setBanner(message: string | null): void {
  ui.banner.hidden = !message;
  ui.banner.textContent = message ?? "";
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

export function setControlsEnabled(enabled: boolean): void {
  for (const b of [ui.sfxAlarm, ui.sfxAmbulance, ui.sfxStop]) b.disabled = !enabled;
  ui.master.disabled = !enabled;
  ui.echo.disabled = !enabled;
  ui.release.disabled = !enabled;
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

export function paintSliders(): void {
  ui.masterVal.textContent = ui.master.value;
  ui.echoVal.textContent = `${ui.echo.value}%`;
  ui.releaseVal.textContent = `${ui.release.value} ms`;
}
