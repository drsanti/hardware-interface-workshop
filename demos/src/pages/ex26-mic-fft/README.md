# ex26 — Mic FFT

**Goal:** stream **MicPcm** into a ring buffer and draw a live **FFT bar
spectrum** with an in-process radix-2 FFT (no Web Audio).

Needs **`es3c28p`** and **USB** (PCM is serial-only).

Enable in [`src/App.tsx`](../../App.tsx): uncomment `Ex26MicFft`
import + `<Route>`, comment the others.

---

## 1. Why this lab?

Time-domain wave (ex14) shows amplitude. Frequency bars show **which
pitches / bands** are loud — the first step toward spectrograms, filters,
and feature extraction.

**Success:** Stream PCM on → speak → blue bars move; peak Hz updates.
Stream off → bars go quiet.

---

## 2. Learning objectives

| Idea | In this exercise |
| ---- | ---------------- |
| MicPcm → ring | Same USB chunks as the wave lab |
| Hann + FFT | Window, then radix-2 magnitude spectrum |
| Byte bins | Map dB to 0..255 for the bar UI |
| Nyquist | 16 kHz capture → useful spectrum to 8 kHz |

---

## 3. Mental model

```
Mic ──► MicPcm 0x24 ──► PcmFftBridge (ring + FFT)
                              │
                              ▼
                        FftSpectrumCard
```

---

## 4. Files

| File | Role |
| ---- | ---- |
| `index.tsx` | Composition |
| `Ex26Header.tsx` | Title copy |
| `hooks/useMicFft.ts` | Mic + FFT rAF loop |
| `lib/pcm/PcmFftBridge.ts` | PCM → AnalyserNode |
| `components/FftSpectrumCard.tsx` | Bar UI |

---

## 5. Checklist

- [ ] Flash `es3c28p`; USB only
- [ ] Connect → Ready → **Stream PCM**
- [ ] Speak — bars respond; peak Hz is plausible
- [ ] Stream off — bars settle

**Previous:** [ex15 — Mic studio](../ex15-mic-studio/)  
**Next:** [ex27 — Mic spectrogram](../ex27-mic-spectrogram/)
