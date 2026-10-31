# ex31 — Mic pitch

<div class="ebook-run">

**Track:** `react` · **Project:** `demos` · **Port:** `5173`

```text
cd demos
vp install   # first time
vp dev
# enable ex31-mic-pitch in demos/src/App.tsx (import + <Route>)
# match WORKSHOP_BOARD_ID in demos/src/lib/workshop.ts
```

<p class="ebook-source"><strong>Source:</strong> <code>demos/src/pages/ex31-mic-pitch/README.md</code></p>

</div>


**Goal:** run **YIN** on **MicPcm** to estimate fundamental frequency,
show a **note name**, and a **cents** needle.

Needs **`es3c28p`** and **USB**.

Enable in [`src/App.tsx`](../../../../demos/src/App.tsx): uncomment `Ex31MicPitch`
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

**Previous:** [ex30 — Mic features](../../generated/react/ex30-mic-features/index.md)  
**Next:** [ex32 — Mic classify](../../generated/react/ex32-mic-classify/index.md)
