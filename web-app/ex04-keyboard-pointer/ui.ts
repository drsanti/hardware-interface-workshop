/**
 * Page widgets only — no pointer/key logic here.
 * Students: prefer reading main.ts.
 */

function requireEl<T extends Element>(id: string, kind: abstract new (...args: never[]) => T): T {
  const el = document.getElementById(id);
  if (!(el instanceof kind)) {
    throw new Error(`ex04: missing #${id} in index.html`);
  }
  return el;
}

export const ui = {
  clear: requireEl("clear", HTMLButtonElement),
  stage: requireEl("stage", HTMLDivElement),
  cursor: requireEl("cursor", HTMLDivElement),
  readout: requireEl("readout", HTMLDivElement),
  eventLog: requireEl("event-log", HTMLUListElement),
};

export function placeCursorEl(x: number, y: number): void {
  ui.cursor.style.left = `${x}px`;
  ui.cursor.style.top = `${y}px`;
}

export function addMarkEl(x: number, y: number, id: number): void {
  const mark = document.createElement("div");
  mark.className = "mark";
  mark.style.left = `${x}px`;
  mark.style.top = `${y}px`;
  mark.dataset.id = String(id);
  ui.stage.append(mark);
}

export function clearMarkEls(): void {
  for (const el of [...ui.stage.querySelectorAll(".mark")]) {
    el.remove();
  }
}

export function setReadout(lines: string[]): void {
  ui.readout.replaceChildren();
  for (const line of lines) {
    const row = document.createElement("div");
    row.textContent = line;
    ui.readout.append(row);
  }
}

export function logEvent(kind: string, detail: string): void {
  const li = document.createElement("li");
  li.textContent = `${new Date().toLocaleTimeString()} · ${kind} · ${detail}`;
  ui.eventLog.prepend(li);
  while (ui.eventLog.children.length > 14) {
    ui.eventLog.lastElementChild?.remove();
  }
}
