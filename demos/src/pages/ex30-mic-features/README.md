# ex30 — Mic features

**Goal:** extract live **audio features** from **MicPcm** (RMS, ZCR,
spectral centroid, flatness, rolloff) and plot short histories.

Needs **`es3c28p`** and **USB**.

Enable in [`src/App.tsx`](../../App.tsx): uncomment `Ex30MicFeatures`
import + `<Route>`, comment the others.

---

## 1. Why this lab?

FFT bars show the spectrum. Features **summarize** it into numbers a
rule or model can use — the bridge to pitch / ML labs.

**Success:** Stream on → speak → RMS and ZCR move; whistle → centroid
climbs; noisy room → flatness rises.

---

## 2. Learning objectives

| Feature | Meaning |
| ------- | ------- |
| RMS | Overall loudness (time domain) |
| ZCR | How often the wave crosses zero |
| Centroid | “Brightness” — center of spectral mass (Hz) |
| Flatness | Tonal (low) vs noise-like (high) |
| Rolloff 85% | Frequency holding most of the energy |

---

## 3. Mental model

```
MicPcm ──► float ring ──► Hann + FFT ──► features
                                  │
                                  ├── meters
                                  └── sparklines (centroid, RMS)
```

---

## 4. Files

| File | Role |
| ---- | ---- |
| `index.tsx` | Composition |
| `Ex30Header.tsx` | Title copy |
| `hooks/useMicFeatures.ts` | Hopped feature tap |
| `lib/pcm/features.ts` | Extractors |
| `components/FeaturesCard.tsx` | UI |

---

## 5. Checklist

- [ ] Flash `es3c28p`; USB only
- [ ] Connect → Stream PCM
- [ ] Speak / whistle / blow noise — meters diverge as expected
- [ ] Sparklines scroll with activity

**Previous:** [ex29 — Mic filter](../ex29-mic-filter/)  
**Next:** [ex31 — Mic pitch](../ex31-mic-pitch/)
