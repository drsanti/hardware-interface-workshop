/** Page widgets only — students: prefer reading main.ts. */

function requireEl<T extends HTMLElement>(id: string, kind: new () => T): T {
  const el = document.getElementById(id);
  if (!(el instanceof kind)) {
    throw new Error(`ex20: missing #${id} in index.html`);
  }
  return el;
}

export const ui = {
  hint: requireEl("hint", HTMLParagraphElement),
  banner: requireEl("banner", HTMLParagraphElement),
  connectSerial: requireEl("connect-serial", HTMLButtonElement),
  disconnect: requireEl("disconnect", HTMLButtonElement),
  status: requireEl("status", HTMLPreElement),
  info: requireEl("info", HTMLPreElement),
  streamOn: requireEl("stream-on", HTMLButtonElement),
  streamOff: requireEl("stream-off", HTMLButtonElement),
  micOff: requireEl("mic-off", HTMLButtonElement),
  rmsTrack: requireEl("rms-track", HTMLDivElement),
  rmsFill: requireEl("rms-fill", HTMLDivElement),
  vuReadout: requireEl("vu-readout", HTMLParagraphElement),
  wave: requireEl("wave", HTMLCanvasElement),
  waveMeta: requireEl("wave-meta", HTMLParagraphElement),
  ack: requireEl("ack", HTMLPreElement),
};

export function setHint(text: string): void {
  ui.hint.textContent = text;
}

export function setBanner(message: string | null): void {
  ui.banner.hidden = !message;
  ui.banner.textContent = message ?? "";
}

export function setLinkButtons(opts: { serial: boolean; disconnect: boolean }): void {
  ui.connectSerial.disabled = !opts.serial;
  ui.disconnect.disabled = !opts.disconnect;
}

export function setControlsEnabled(enabled: boolean): void {
  ui.streamOn.disabled = !enabled;
  ui.streamOff.disabled = !enabled;
  ui.micOff.disabled = !enabled;
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

export function paintVu(opts: {
  active: boolean;
  rmsPct: number;
  rms: number;
  peak: number;
  clipped: boolean;
}): void {
  const rms = Math.max(0, Math.min(100, opts.rmsPct));
  ui.rmsFill.style.width = opts.active ? `${rms.toFixed(1)}%` : "0%";
  ui.rmsTrack.setAttribute("aria-valuenow", String(Math.round(opts.active ? rms : 0)));
  if (!opts.active) {
    ui.vuReadout.textContent = "Stream off";
    return;
  }
  ui.vuReadout.textContent = [
    `rms ${rms.toFixed(0)}%`,
    `amp ${opts.rms}/${opts.peak}`,
    opts.clipped ? "CLIP" : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

/** Draw scrolling scope from −1..1 samples; auto-gain for speech. */
export function paintWave(samples: Float32Array): void {
  const canvas = ui.wave;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  const mid = h / 2;

  let peak = 0;
  for (let i = 0; i < samples.length; i++) {
    const a = Math.abs(samples[i] ?? 0);
    if (a > peak) peak = a;
  }
  const gain = peak > 0.02 ? Math.min(10, 0.9 / peak) : 5;

  ctx.fillStyle = "#0f1613";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "#30363d";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, mid);
  ctx.lineTo(w, mid);
  ctx.stroke();

  ctx.strokeStyle = "#0f6e56";
  ctx.lineWidth = 1.75;
  ctx.beginPath();
  for (let i = 0; i < samples.length; i++) {
    const x = (i / Math.max(1, samples.length - 1)) * w;
    const y = mid - (samples[i] ?? 0) * gain * (h * 0.45);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ui.waveMeta.textContent = peak > 0
    ? `display ×${gain.toFixed(1)} · peak ${(peak * 100).toFixed(0)}% FS`
    : `display ×${gain.toFixed(1)}`;
}
