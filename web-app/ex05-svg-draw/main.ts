/**
 * SVG draw — focus here.
 *
 *   createElementNS("http://www.w3.org/2000/svg", "polyline")
 *   setAttribute("points", "x,y x,y …")
 *
 * UI markup: index.html · paint helpers: ui.ts
 */

import { clearPolylines, setPressedSwatch, setReadout, ui } from "./ui";

const SVG_NS = "http://www.w3.org/2000/svg";

type Pt = { x: number; y: number };

let strokeColor = ui.swatches[0]?.dataset.color ?? "#7dd3a7";
let drawing = false;
let current: SVGPolylineElement | null = null;
let points: Pt[] = [];
let strokeCount = 0;

function svgPoint(ev: PointerEvent): Pt {
  const rect = ui.pad.getBoundingClientRect();
  return {
    x: ((ev.clientX - rect.left) / rect.width) * 640,
    y: ((ev.clientY - rect.top) / rect.height) * 260,
  };
}

function pointsAttr(pts: Pt[]): string {
  return pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
}

function refreshReadout(): void {
  setReadout(`strokes=${strokeCount} · color=${strokeColor}`);
}

function beginStroke(ev: PointerEvent): void {
  drawing = true;
  ui.pad.setPointerCapture(ev.pointerId);
  points = [svgPoint(ev)];

  const line = document.createElementNS(SVG_NS, "polyline");
  line.setAttribute("fill", "none");
  line.setAttribute("stroke", strokeColor);
  line.setAttribute("stroke-width", "3");
  line.setAttribute("stroke-linecap", "round");
  line.setAttribute("stroke-linejoin", "round");
  line.setAttribute("points", pointsAttr(points));
  ui.pad.append(line);

  current = line;
  strokeCount += 1;
  refreshReadout();
}

function extendStroke(ev: PointerEvent): void {
  if (!drawing || !current) return;
  points.push(svgPoint(ev));
  current.setAttribute("points", pointsAttr(points));
}

function endStroke(ev: PointerEvent): void {
  if (!drawing) return;
  drawing = false;
  current = null;
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
  clearPolylines();
  strokeCount = 0;
  drawing = false;
  current = null;
  refreshReadout();
});

refreshReadout();
