/**
 * Form events — focus here.
 *
 *   input  → live as the value changes
 *   change → when the value is committed
 *   submit → FormData + preventDefault (no page reload)
 *
 * UI markup: index.html · paint helpers: ui.ts
 */

import { logEvent, prependSaved, setPreview, setStatus, ui } from "./ui";

function roleLabel(): string {
  return ui.role.selectedOptions[0]?.textContent ?? ui.role.value;
}

function refreshPreview(): void {
  const name = ui.name.value.trim();
  if (!name) {
    setPreview("Preview updates on every input…", true);
    return;
  }
  setPreview(`${name} · ${roleLabel()}${ui.notify.checked ? " · notify" : ""}`, false);
}

ui.name.addEventListener("input", () => {
  refreshPreview();
  setStatus(`input → “${ui.name.value}”`);
  logEvent("input", `name="${ui.name.value}"`);
});

ui.role.addEventListener("change", () => {
  refreshPreview();
  setStatus(`change → role=${ui.role.value}`);
  logEvent("change", `role=${ui.role.value}`);
});

ui.notify.addEventListener("change", () => {
  refreshPreview();
  setStatus(`change → notify=${ui.notify.checked}`);
  logEvent("change", `notify=${ui.notify.checked}`);
});

ui.form.addEventListener("submit", (ev) => {
  // Without this, the browser would navigate / reload.
  ev.preventDefault();

  const data = new FormData(ui.form);
  const nameRaw = data.get("name");
  const roleRaw = data.get("role");
  const name = (typeof nameRaw === "string" ? nameRaw : "").trim();
  const role = typeof roleRaw === "string" ? roleRaw : "";
  const notify = data.get("notify") === "on";

  if (!name) {
    setStatus("submit blocked — name is empty.");
    logEvent("submit", "rejected (empty name)");
    ui.name.focus();
    return;
  }

  prependSaved(`${name} · ${role}${notify ? " · notify" : ""}`);
  setStatus(`submit → saved “${name}” (no reload)`);
  logEvent("submit", `saved name="${name}" role=${role} notify=${notify}`);

  ui.name.value = "";
  refreshPreview();
  ui.name.focus();
});
