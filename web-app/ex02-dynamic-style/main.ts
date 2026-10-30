/**
 * Drive CSS from TypeScript on a timer.
 *
 *   setInterval → update numbers → assign element.style.*
 *
 * Properties used here: backgroundColor, width, height, left, top, transform
 * (translate + rotate), borderRadius, opacity.
 */

const TICK_MS = 32; // ~30 fps

const mount = document.getElementById("mount");
if (!(mount instanceof HTMLElement)) {
  throw new Error("ex02: expected #mount in the HTML.");
}

type StyleParams = {
  t: number;
  hue: number;
  size: number;
  x: number;
  y: number;
  rot: number;
  radius: number;
  alpha: number;
};

const title = document.createElement("h2");
title.textContent = "Animated box";

const hint = document.createElement("p");
hint.className = "hint";
hint.textContent = "Pause freezes the numbers. Edit the formulas in tick() to change the motion.";

const toolbar = document.createElement("div");
toolbar.className = "toolbar";

const toggleBtn = document.createElement("button");
toggleBtn.type = "button";
toggleBtn.className = "btn btn-primary";
toggleBtn.textContent = "Pause";

const resetBtn = document.createElement("button");
resetBtn.type = "button";
resetBtn.className = "btn btn-ghost";
resetBtn.textContent = "Reset t";

toolbar.append(toggleBtn, resetBtn);

const stage = document.createElement("div");
stage.className = "stage";
stage.setAttribute("aria-label", "Animation stage");

const box = document.createElement("div");
box.className = "shape";
stage.append(box);

const readout = document.createElement("div");
readout.className = "readout";
readout.setAttribute("aria-live", "off");

mount.append(title, hint, toolbar, stage, readout);

const params: StyleParams = {
  t: 0,
  hue: 0,
  size: 48,
  x: 0,
  y: 0,
  rot: 0,
  radius: 12,
  alpha: 1,
};

function applyStyle(p: StyleParams): void {
  const stageW = stage.clientWidth;
  const stageH = stage.clientHeight;

  box.style.width = `${p.size}px`;
  box.style.height = `${p.size}px`;
  box.style.backgroundColor = `hsla(${p.hue}, 70%, 55%, ${p.alpha})`;
  box.style.borderRadius = `${p.radius}px`;
  box.style.left = `${p.x}px`;
  box.style.top = `${p.y}px`;
  /* Keep the box roughly centered while rotating */
  box.style.transform = `translate(${-p.size / 2}px, ${-p.size / 2}px) rotate(${p.rot}deg)`;

  readout.replaceChildren();
  const lines = [
    `t=${p.t.toFixed(2)}`,
    `hue=${p.hue.toFixed(0)}°`,
    `size=${p.size.toFixed(0)}px`,
    `pos=${p.x.toFixed(0)},${p.y.toFixed(0)} (stage ${stageW}×${stageH})`,
    `rot=${p.rot.toFixed(0)}°`,
    `radius=${p.radius.toFixed(0)}px`,
    `alpha=${p.alpha.toFixed(2)}`,
  ];
  for (const line of lines) {
    const row = document.createElement("div");
    row.textContent = line;
    readout.append(row);
  }
}

function tick(): void {
  params.t += 0.05;

  /* --- formulas students can edit --- */
  params.hue = (params.t * 40) % 360;
  params.size = 40 + 28 * (0.5 + 0.5 * Math.sin(params.t * 1.3));
  params.x = stage.clientWidth * 0.5 + Math.sin(params.t) * (stage.clientWidth * 0.32);
  params.y = stage.clientHeight * 0.5 + Math.cos(params.t * 0.85) * (stage.clientHeight * 0.28);
  params.rot = params.t * 55;
  params.radius = 8 + 20 * (0.5 + 0.5 * Math.sin(params.t * 2.1));
  params.alpha = 0.55 + 0.4 * (0.5 + 0.5 * Math.sin(params.t * 0.7));
  /* --------------------------------- */

  applyStyle(params);
}

let timer: ReturnType<typeof setInterval> | null = null;

function start(): void {
  if (timer != null) return;
  timer = setInterval(tick, TICK_MS);
  toggleBtn.textContent = "Pause";
}

function pause(): void {
  if (timer == null) return;
  clearInterval(timer);
  timer = null;
  toggleBtn.textContent = "Play";
}

toggleBtn.addEventListener("click", () => {
  if (timer == null) start();
  else pause();
});

resetBtn.addEventListener("click", () => {
  params.t = 0;
  tick();
});

/* Clean up if the module hot-reloads during vp dev */
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    pause();
  });
}

start();
tick();
