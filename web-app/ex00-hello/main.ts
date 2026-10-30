/**
 * TypeScript = JavaScript + types (checked by `tsc` / the IDE).
 * Vite compiles `.ts` in the browser — no separate build step for `vp dev`.
 *
 * 1. Find elements that already exist in the HTML (by id).
 * 2. Listen for a user event (click).
 * 3. Update the page (change text).
 */

const countEl = document.getElementById("count");
const bumpBtn = document.getElementById("bump");

if (!(countEl instanceof HTMLElement) || !(bumpBtn instanceof HTMLButtonElement)) {
  throw new Error("ex00: expected #count and #bump in the HTML.");
}

let clicks = 0;

bumpBtn.addEventListener("click", () => {
  clicks += 1;
  countEl.textContent = String(clicks);
});
