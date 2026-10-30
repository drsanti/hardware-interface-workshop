/**
 * Page widgets only — no BoardSession / serial here.
 * Students: prefer reading main.ts.
 */

function requireEl<T extends HTMLElement>(id: string, kind: new () => T): T {
  const el = document.getElementById(id);
  if (!(el instanceof kind)) {
    throw new Error(`ex10: missing #${id} in index.html`);
  }
  return el;
}

export const ui = {
  hint: requireEl("hint", HTMLParagraphElement),
  banner: requireEl("banner", HTMLParagraphElement),
  connect: requireEl("connect", HTMLButtonElement),
  disconnect: requireEl("disconnect", HTMLButtonElement),
  status: requireEl("status", HTMLPreElement),
  info: requireEl("info", HTMLPreElement),
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

export function setButtons(opts: { connect: boolean; disconnect: boolean }): void {
  ui.connect.disabled = !opts.connect;
  ui.disconnect.disabled = !opts.disconnect;
}

export function setStatusText(text: string): void {
  ui.status.textContent = text;
}

export function setInfoText(text: string): void {
  ui.info.textContent = text;
}
