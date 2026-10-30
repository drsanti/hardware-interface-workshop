/**
 * Create elements with the DOM API (no JSX, no React).
 *
 * Pattern:
 *   1. document.createElement("tag")
 *   2. set text / class / attributes
 *   3. parent.append(...)  (or appendChild)
 */

const mount = document.getElementById("mount");
if (!(mount instanceof HTMLElement)) {
  throw new Error("ex01: expected #mount in the HTML.");
}

const LABELS = ["red", "green", "blue", "amber", "violet", "cyan"] as const;

let nextId = 1;

const title = document.createElement("h2");
title.textContent = "Live list";

const hint = document.createElement("p");
hint.className = "hint";
hint.textContent = "Each click builds an <li> in memory, then appends it to the <ul>.";

const toolbar = document.createElement("div");
toolbar.className = "toolbar";

const addBtn = document.createElement("button");
addBtn.type = "button";
addBtn.className = "btn btn-primary";
addBtn.textContent = "Add item";

const clearBtn = document.createElement("button");
clearBtn.type = "button";
clearBtn.className = "btn btn-ghost";
clearBtn.textContent = "Clear";

toolbar.append(addBtn, clearBtn);

const list = document.createElement("ul");
list.className = "item-list";
list.setAttribute("aria-live", "polite");

const status = document.createElement("p");
status.className = "status";

function refreshStatus(): void {
  const n = list.children.length;
  status.textContent = n === 0 ? "items: 0" : `items: ${n}`;
}

function addItem(): void {
  const id = nextId++;
  const label = LABELS[(id - 1) % LABELS.length]!;

  const li = document.createElement("li");
  li.className = "item";
  li.dataset.id = String(id);

  const text = document.createElement("span");
  text.className = "item-label";
  text.textContent = `#${id} · ${label}`;

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "item-remove";
  remove.textContent = "Remove";
  remove.addEventListener("click", () => {
    li.remove();
    refreshStatus();
  });

  li.append(text, remove);
  list.append(li);
  refreshStatus();
}

addBtn.addEventListener("click", addItem);

clearBtn.addEventListener("click", () => {
  list.replaceChildren();
  refreshStatus();
});

mount.append(title, hint, toolbar, list, status);
refreshStatus();
