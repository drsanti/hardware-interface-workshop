# ex27 — Mic spectrogram

<div class="ebook-run">

**Track:** `react` · **Project:** `demos` · **Port:** `5173`

```text
cd demos
vp install   # first time
vp dev
# enable ex27-mic-spectrogram in demos/src/App.tsx (import + <Route>)
# match WORKSHOP_BOARD_ID in demos/src/lib/workshop.ts
```

<p class="ebook-source"><strong>Source:</strong> <code>demos/src/pages/ex27-mic-spectrogram/README.md</code></p>

</div>


**Goal:** stream **MicPcm**, hop an FFT over time, and paint a scrolling
**spectrogram** (time × frequency).

Needs **`es3c28p`** and **USB**.

Enable in [`src/App.tsx`](../../../../demos/src/App.tsx): uncomment `Ex27MicSpectrogram`
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

**Previous:** [ex26 — Mic FFT](../../generated/react/ex26-mic-fft/index.md)  
**Next:** [ex28 — Mic recorder](../../generated/react/ex28-mic-recorder/index.md)
