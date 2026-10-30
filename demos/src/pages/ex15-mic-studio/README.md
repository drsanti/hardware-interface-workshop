# ex15 — Mic studio

**Goal:** one page with **enable**, **VU**, **gain/mute**, and **PCM
waveform** — the full mic story from ex11–ex14.

Needs **`es3c28p`**.

Enable in [`src/App.tsx`](../../App.tsx): uncomment `Ex15MicStudio`
import + `<Route>`, comment the others.

---

## 1. Why this lab?

Same as LED/SFX studios: compose prior skills into a single control
surface. No new message types — only UX composition.

**Success:** In one session you enable the mic, see VU, adjust gain,
mute, and watch the waveform with stream on.

---

## 2. Learning objectives

| Idea | In this exercise |
| ---- | ---------------- |
| Feature flags | `vu` + `gain` + `wave` on `MicControlCard` |
| Traffic awareness | Level alone is light; stream is heavy |
| Clean shutdown | Mic off / stream off before disconnect |

---

## 3. Before you start

1. Flash `firmware-prebuilt/es3c28p/`.
2. Ideally finish ex11–ex14 once.

---

## 4. Suggested walkthrough

1. Connect → Ready.
2. **Mic on** → VU moves when you speak.
3. Change **Gain**; try **Mute**.
4. **Stream PCM** → waveform animates.
5. Stream off → Mic off → Disconnect.

---

## 5. Mental model

```
┌──────────────────────────────────┐
│ Mic studio                       │
│  [Mic on] [Mute] [Stream PCM]    │
│  VU bar + peak                   │
│  Gain slider                     │
│  Waveform strip                  │
└────────────────┬─────────────────┘
                 │ MicCmd / AudioLevel / MicPcm
                 ▼
            es3c28p mic path
```

---

## 6. Files

| File | Role |
| ---- | ---- |
| `index.tsx` | All mic features on |
| `Ex15Header.tsx` | Title + copy |
| Shared | `useMic`, `MicControlCard`, `lib/wire/mic.ts` |

---

## 7. Checklist

- [ ] VU works with Mic on
- [ ] Gain / mute affect the meter
- [ ] Stream draws a live waveform
- [ ] Clean stop before unplug

**Previous:** [ex14 — Mic wave](../ex14-mic-wave/)  
**Next:** [ex16 — Key hello](../ex16-key-hello/)
