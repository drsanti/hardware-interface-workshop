/** Page widgets only — students: prefer reading main.ts. */

function requireEl<T extends HTMLElement>(id: string, kind: new () => T): T {
  const el = document.getElementById(id);
  if (!(el instanceof kind)) {
    throw new Error(`ex19: missing #${id} in index.html`);
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
  micOn: requireEl("mic-on", HTMLButtonElement),
  micOff: requireEl("mic-off", HTMLButtonElement),
  mute: requireEl("mute", HTMLButtonElement),
  rmsTrack: requireEl("rms-track", HTMLDivElement),
  rmsFill: requireEl("rms-fill", HTMLDivElement),
  peakMark: requireEl("peak-mark", HTMLDivElement),
  vuReadout: requireEl("vu-readout", HTMLParagraphElement),
  gain: requireEl("gain", HTMLInputElement),
  gainApply: requireEl("gain-apply", HTMLButtonElement),
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
  ui.micOn.disabled = !enabled;
  ui.micOff.disabled = !enabled;
  ui.mute.disabled = !enabled;
  ui.gain.disabled = !enabled;
  ui.gainApply.disabled = !enabled;
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

export function setMuteLabel(muted: boolean): void {
  ui.mute.textContent = muted ? "Unmute" : "Mute";
}

export function paintGain(): void {
  ui.gainApply.textContent = `${ui.gain.value}%`;
}

export function paintVu(opts: {
  active: boolean;
  rmsPct: number;
  peakPct: number;
  rms: number;
  peak: number;
  clipped: boolean;
}): void {
  const rms = Math.max(0, Math.min(100, opts.rmsPct));
  const peak = Math.max(0, Math.min(100, opts.peakPct));
  ui.rmsFill.style.width = opts.active ? `${rms.toFixed(1)}%` : "0%";
  ui.rmsTrack.setAttribute("aria-valuenow", String(Math.round(opts.active ? rms : 0)));
  ui.peakMark.style.left = opts.active ? `${peak.toFixed(1)}%` : "0%";
  if (!opts.active) {
    ui.vuReadout.textContent = "Mic off";
    return;
  }
  ui.vuReadout.textContent = [
    `rms ${rms.toFixed(0)}% · peak ${peak.toFixed(0)}%`,
    `amp ${opts.rms}/${opts.peak}`,
    opts.clipped ? "CLIP" : null,
  ]
    .filter(Boolean)
    .join(" · ");
}
