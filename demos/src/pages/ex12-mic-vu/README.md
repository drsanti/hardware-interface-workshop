# ex12 — Mic VU meter

**Goal:** same `AudioLevel` stream as ex11, drawn as a **bar + peak
tick** (VU) instead of raw numbers only.

Needs **`es3c28p`**.

Enable in [`src/App.tsx`](../../App.tsx): uncomment `Ex12MicVu`
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
2. Finish [ex11](../ex11-mic-hello/).

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

**Previous:** [ex11 — Mic hello](../ex11-mic-hello/)  
**Next:** [ex13 — Mic gain](../ex13-mic-gain/)
