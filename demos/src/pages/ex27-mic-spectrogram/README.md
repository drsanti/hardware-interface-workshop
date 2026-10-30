# ex27 — Mic spectrogram

**Goal:** stream **MicPcm**, hop an FFT over time, and paint a scrolling
**spectrogram** (time × frequency).

Needs **`es3c28p`** and **USB**.

Enable in [`src/App.tsx`](../../App.tsx): uncomment `Ex27MicSpectrogram`
import + `<Route>`, comment the others.

---

## 1. Why this lab?

ex26 shows **one** spectrum snapshot as bars. A spectrogram stacks those
snapshots so you see how pitch / formants move — the bridge to filters
and feature labs.

**Success:** Stream PCM on → speak → a bright trail scrolls right→left
history; whistle shows a thin horizontal band.

---

## 2. Learning objectives

| Idea | In this exercise |
| ---- | ---------------- |
| Hop / overlap | FFT every `hop` samples (default 256 @ 16 kHz) |
| Column paint | Each hop → one canvas pixel column |
| Heat map | Magnitude 0..255 → blue…yellow…white |
| Axes | X = time (newer right), Y = Hz (0 at bottom) |

---

## 3. Mental model

```
MicPcm ──► ring ──► FFT every hop ──► column[bins]
                                         │
                                         ▼
                              scroll canvas ← paint right edge
```

---

## 4. Files

| File | Role |
| ---- | ---- |
| `index.tsx` | Composition |
| `Ex27Header.tsx` | Title copy |
| `hooks/useMicSpectrogram.ts` | Hopped columns |
| `lib/pcm/PcmFftBridge.ts` | `takeColumn()` |
| `components/SpectrogramCard.tsx` | Canvas UI |

---

## 5. Checklist

- [ ] Flash `es3c28p`; USB only
- [ ] Connect → **Stream PCM**
- [ ] Speak / whistle — trail appears; high pitch is higher on the plot
- [ ] Stream off — scroll freezes

**Previous:** [ex26 — Mic FFT](../ex26-mic-fft/)  
**Next:** [ex28 — Mic recorder](../ex28-mic-recorder/)
