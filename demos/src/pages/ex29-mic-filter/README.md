# ex29 — Mic filter

**Goal:** apply a live **biquad** (low / high / band-pass) to **MicPcm**,
see the effect on the **FFT**, and optionally **monitor** on PC speakers.

Needs **`es3c28p`** and **USB**.

Enable in [`src/App.tsx`](../../App.tsx): uncomment `Ex29MicFilter`
import + `<Route>`, comment the others.

---

## 1. Why this lab?

Recording (ex28) keeps dry PCM. Filtering teaches **IIR coefficients**,
cutoff / Q, and hearing the difference — the step before feature
extraction.

**Success:** Stream on → Low-pass at ~800 Hz → FFT highs shrink; Monitor
on → voice sounds muffled. High-pass clears the rumble.

---

## 2. Learning objectives

| Idea | In this exercise |
| ---- | ---------------- |
| Biquad | RBJ cookbook LP / HP / BP |
| Wet path | Filter before FFT + optional speakers |
| Cutoff / Q | Sweep while speaking |
| Bypass | A/B dry MicPcm |
| Monitor | ScriptProcessor playback of wet float PCM |

---

## 3. Mental model

```
MicPcm ──► Biquad ──┬──► PcmFftBridge ──► bars
                    └──► PcmPlaybackBridge (if Monitor)
```

---

## 4. Files

| File | Role |
| ---- | ---- |
| `index.tsx` | Composition |
| `Ex29Header.tsx` | Title copy |
| `hooks/useMicFilter.ts` | Wire filter + FFT + monitor |
| `lib/pcm/biquad.ts` | IIR |
| `lib/pcm/PcmPlaybackBridge.ts` | Audible ring |
| `components/FilterCard.tsx` | Controls |

---

## 5. Checklist

- [ ] Flash `es3c28p`; USB only
- [ ] Connect → Stream PCM → pick Low-pass → sweep cutoff
- [ ] FFT highs fall as cutoff drops
- [ ] Monitor on — hear muffled vs Bypass

**Previous:** [ex28 — Mic recorder](../ex28-mic-recorder/)  
**Next:** [ex30 — Mic features](../ex30-mic-features/)
