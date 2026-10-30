/**
 * Keyboard + pointer — focus here.
 *
 *   pointerdown → place a mark at offsetX / offsetY
 *   keydown     → arrows nudge cursor; Enter marks; Escape clears
 *
 * UI markup: index.html · paint helpers: ui.ts
 */

import { addMarkEl, clearMarkEls, logEvent, placeCursorEl, setReadout, ui } from "./ui";

const STEP = 12;

let cursorX = 0;
let cursorY = 0;
let markCount = 0;

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function placeCursor(x: number, y: number): void {
  cursorX = clamp(x, 0, ui.stage.clientWidth);
  cursorY = clamp(y, 0, ui.stage.clientHeight);
  placeCursorEl(cursorX, cursorY);
  refreshReadout();
}

function addMark(x: number, y: number): void {
  markCount += 1;
  addMarkEl(x, y, markCount);
  refreshReadout();
}

function clearMarks(): void {
  clearMarkEls();
  markCount = 0;
  refreshReadout();
}

function refreshReadout(): void {
  setReadout([
    `cursor = ${cursorX.toFixed(0)}, ${cursorY.toFixed(0)}`,
    `marks = ${markCount}`,
    `focused = ${document.activeElement === ui.stage}`,
  ]);
}

ui.stage.addEventListener("pointerdown", (ev) => {
  ui.stage.focus();
  const x = ev.offsetX;
  const y = ev.offsetY;
  placeCursor(x, y);
  addMark(x, y);
  logEvent("pointerdown", `x=${x.toFixed(0)} y=${y.toFixed(0)} pointerType=${ev.pointerType}`);
});

ui.stage.addEventListener("keydown", (ev) => {
  const key = ev.key;

  if (key === "ArrowLeft" || key === "ArrowRight" || key === "ArrowUp" || key === "ArrowDown") {
    ev.preventDefault(); // stop page scroll while nudging
    const dx = key === "ArrowLeft" ? -STEP : key === "ArrowRight" ? STEP : 0;
    const dy = key === "ArrowUp" ? -STEP : key === "ArrowDown" ? STEP : 0;
    placeCursor(cursorX + dx, cursorY + dy);
    logEvent("keydown", key);
    return;
  }

  if (key === "Enter") {
    ev.preventDefault();
    addMark(cursorX, cursorY);
    logEvent("keydown", "Enter → mark");
    return;
  }

  if (key === "Escape") {
    ev.preventDefault();
    clearMarks();
    logEvent("keydown", "Escape → clear");
  }
});

ui.stage.addEventListener("focus", () => {
  refreshReadout();
  logEvent("focus", "stage");
});

ui.stage.addEventListener("blur", () => {
  refreshReadout();
  logEvent("blur", "stage");
});

ui.clear.addEventListener("click", () => {
  clearMarks();
  logEvent("click", "Clear marks");
});

requestAnimationFrame(() => {
  placeCursor(ui.stage.clientWidth / 2, ui.stage.clientHeight / 2);
});
