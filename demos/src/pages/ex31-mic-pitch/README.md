# ex31 — Mic pitch

**Goal:** run **YIN** on **MicPcm** to estimate fundamental frequency,
show a **note name**, and a **cents** needle.

Needs **`es3c28p`** and **USB**.

Enable in [`src/App.tsx`](../../App.tsx): uncomment `Ex31MicPitch`
import + `<Route>`, comment the others.

---

## 1. Why this lab?

Centroid (ex30) is brightness. Pitch is the **perceived fundamental** —
useful for tuners, melody games, and as a feature for ML.

**Success:** Stream on → whistle a steady tone → big note (e.g. `A5`)
and Hz update; slide pitch → cents needle moves.

---

## 2. Learning objectives

| Idea | In this exercise |
| ---- | ---------------- |
| YIN | Difference function + cumulative mean + threshold |
| Voicing | Confidence + RMS gate unvoiced frames |
| MIDI / note | `69 + 12·log2(f/440)` |
| Cents | Fine offset from equal temperament |

Tip: **whistle or hum** works better than talking.

---

## 3. Mental model

```
MicPcm ──► 2048 float window ──► YIN ──► Hz / note / cents
```

---

## 4. Files

| File | Role |
| ---- | ---- |
| `index.tsx` | Composition |
| `Ex31Header.tsx` | Title copy |
| `hooks/useMicPitch.ts` | Pitch tap |
| `lib/pcm/yin.ts` | YIN + note map |
| `components/PitchCard.tsx` | UI |

---

## 5. Checklist

- [ ] Flash `es3c28p`; USB only
- [ ] Connect → Stream PCM
- [ ] Whistle — note + Hz stable
- [ ] Bend pitch — cents needle tracks

**Previous:** [ex30 — Mic features](../ex30-mic-features/)  
**Next:** [ex32 — Mic classify](../ex32-mic-classify/)
