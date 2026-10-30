/**
 * Page widgets only — no form-event logic here.
 * Students: prefer reading main.ts.
 */

function requireEl<T extends Element>(id: string, kind: abstract new (...args: never[]) => T): T {
  const el = document.getElementById(id);
  if (!(el instanceof kind)) {
    throw new Error(`ex03: missing #${id} in index.html`);
  }
  return el;
}

export const ui = {
  form: requireEl("badge-form", HTMLFormElement),
  name: requireEl("name", HTMLInputElement),
  role: requireEl("role", HTMLSelectElement),
  notify: requireEl("notify", HTMLInputElement),
  preview: requireEl("preview", HTMLParagraphElement),
  status: requireEl("status", HTMLParagraphElement),
  savedList: requireEl("saved-list", HTMLUListElement),
  eventLog: requireEl("event-log", HTMLUListElement),
};

export function setStatus(text: string): void {
  ui.status.textContent = text;
}

export function setPreview(text: string, empty: boolean): void {
  ui.preview.textContent = text;
  ui.preview.classList.toggle("preview-empty", empty);
}

export function prependSaved(text: string): void {
  const li = document.createElement("li");
  li.textContent = text;
  ui.savedList.prepend(li);
}

export function logEvent(kind: string, detail: string): void {
  const li = document.createElement("li");
  li.textContent = `${new Date().toLocaleTimeString()} · ${kind} · ${detail}`;
  ui.eventLog.prepend(li);
  while (ui.eventLog.children.length > 12) {
    ui.eventLog.lastElementChild?.remove();
  }
}
