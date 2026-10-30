/**
 * Canvas draw — focus here.
 *
 *   ctx.beginPath() → moveTo / lineTo → stroke()
 *
 * Compare with ex05: no polyline DOM nodes — only pixels.
 * UI markup: index.html · paint helpers: ui.ts
 */

import { setPressedSwatch, setReadout, ui } from "./ui";

const CSS_H = 260;

const ctxRaw = ui.pad.getContext("2d");
if (!ctxRaw) {
  throw new Error("ex06: 2d canvas context unavailable.");
}
const ctx: CanvasRenderingContext2D = ctxRaw;

let strokeColor = ui.swatches[0]?.dataset.color ?? "#7dd3a7";
let drawing = false;
let strokeCount = 0;

function sizeCanvas(): void {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const cssW = ui.wrap.clientWidth || 640;
  ui.pad.style.width = `${cssW}px`;
  ui.pad.style.height = `${CSS_H}px`;
  ui.pad.width = Math.round(cssW * dpr);
  ui.pad.height = Math.round(CSS_H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = 3;
  // Clearing on resize is intentional for this lab.
  strokeCount = 0;
  refreshReadout();
}

function canvasPoint(ev: PointerEvent): { x: number; y: number } {
  const rect = ui.pad.getBoundingClientRect();
  return {
    x: ev.clientX - rect.left,
    y: ev.clientY - rect.top,
  };
}

function refreshReadout(): void {
  setReadout(`strokes=${strokeCount} · color=${strokeColor} · ${ui.pad.width}×${ui.pad.height}px`);
}

function beginStroke(ev: PointerEvent): void {
  drawing = true;
  ui.pad.setPointerCapture(ev.pointerId);
  const p = canvasPoint(ev);
  ctx.strokeStyle = strokeColor;
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  strokeCount += 1;
  refreshReadout();
}

function extendStroke(ev: PointerEvent): void {
  if (!drawing) return;
  const p = canvasPoint(ev);
  ctx.lineTo(p.x, p.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
}

function endStroke(ev: PointerEvent): void {
  if (!drawing) return;
  drawing = false;
  try {
    ui.pad.releasePointerCapture(ev.pointerId);
  } catch {
    /* ok */
  }
}

for (const sw of ui.swatches) {
  sw.addEventListener("click", () => {
    strokeColor = sw.dataset.color ?? strokeColor;
    setPressedSwatch(sw);
    refreshReadout();
  });
}

ui.pad.addEventListener("pointerdown", (ev) => {
  if (ev.button !== 0) return;
  beginStroke(ev);
});
ui.pad.addEventListener("pointermove", extendStroke);
ui.pad.addEventListener("pointerup", endStroke);
ui.pad.addEventListener("pointercancel", endStroke);

ui.clear.addEventListener("click", () => {
  // Drawing uses CSS-pixel transform (see sizeCanvas); clear in that space.
  ctx.clearRect(0, 0, ui.pad.clientWidth, ui.pad.clientHeight);
  strokeCount = 0;
  drawing = false;
  refreshReadout();
});

sizeCanvas();
window.addEventListener("resize", sizeCanvas);
