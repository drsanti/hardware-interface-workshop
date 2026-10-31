# ex12 — Mic VU meter

<div class="ebook-run">

**Track:** `react` · **Project:** `demos` · **Port:** `5173`

```text
cd demos
vp install   # first time
vp dev
# enable ex12-mic-vu in demos/src/App.tsx (import + <Route>)
# match WORKSHOP_BOARD_ID in demos/src/lib/workshop.ts
```

<p class="ebook-source"><strong>Source:</strong> <code>demos/src/pages/ex12-mic-vu/README.md</code></p>

</div>


**Goal:** same `AudioLevel` stream as ex11, drawn as a **bar + peak
tick** (VU) instead of raw numbers only.

Needs **`es3c28p`**.

Enable in [`src/App.tsx`](../../../../demos/src/App.tsx): uncomment `Ex12MicVu`
import + `<Route>`, comment the others.

---

## 1. Why this lab?

Numbers prove the wire works; a VU teaches **mapping telemetry → UI**
(`rms`/`peak` → percent width). Same messages, richer display.

**Success:** Mic on → green bar follows loudness; yellow tick shows
recent peak. Clap and watch both move.

---

## 2. Learning objectives

| Idea | In this exercise |
| ---- | ---------------- |
| Level → percent | `levelToPercent` (0…32767 → 0…100) |
| Peak hold tick | Peak drawn separately from RMS fill |
| Clip flag | Shown when the board marks clipping |

---

## 3. Before you start

1. Flash `firmware-prebuilt/es3c28p/`.
2. Finish [ex11](../../generated/react/ex11-mic-hello/index.md).

---

## 4. What you do

1. Connect → Ready → **Mic on**.
2. Speak softly then loudly — bar grows.
3. Clap — peak tick jumps right.
4. **Mic off**.

---

## 5. Mental model

```
AudioLevel.rms  ──► bar width
AudioLevel.peak ──► tick position
AudioLevel.clipped ──► "CLIP" label
```

---

## 6. Files

| File | Role |
| ---- | ---- |
| `index.tsx` | `features={{ vu: true }}` |
| `MicControlCard.tsx` | `VuBar` component |
| `lib/wire/mic.ts` | `levelToPercent` |

---

## 7. Checklist

- [ ] Bar responds to voice
- [ ] Peak tick moves on claps
- [ ] Quiet room → bar near empty

**Previous:** [ex11 — Mic hello](../../generated/react/ex11-mic-hello/index.md)  
**Next:** [ex13 — Mic gain](../../generated/react/ex13-mic-gain/index.md)
