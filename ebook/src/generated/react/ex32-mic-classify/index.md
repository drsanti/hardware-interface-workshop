# ex32 — Mic classify

<div class="ebook-run">

**Track:** `react` · **Project:** `demos` · **Port:** `5173`

```text
cd demos
vp install   # first time
vp dev
# enable ex32-mic-classify in demos/src/App.tsx (import + <Route>)
# match WORKSHOP_BOARD_ID in demos/src/lib/workshop.ts
```

<p class="ebook-source"><strong>Source:</strong> <code>demos/src/pages/ex32-mic-classify/README.md</code></p>

</div>


**Goal:** classify **silence / speech / whistle / noise** from MicPcm
features. Start with **baseline rules**, then train a tiny **k-NN** by
marking frames.

Needs **`es3c28p`** and **USB**.

Enable in [`src/App.tsx`](../../../../demos/src/App.tsx): uncomment `Ex32MicClassify`
import + `<Route>`, comment the others.

---

## 1. Why this lab?

Features and pitch are inputs. Classification is the first **ML-shaped**
lab: vector → label, with optional student-labeled training — no cloud,
no TensorFlow required.

**Success:** Stream on → quiet room shows `silence`; talk → `speech`;
whistle → `whistle`. Mark a few of each → mode flips to `knn`.

---

## 2. Learning objectives

| Idea | In this exercise |
| ---- | ---------------- |
| Feature vector | RMS, ZCR, centroid, flatness, rolloff |
| Baseline | Hand-tuned rules so it works day one |
| k-NN | Distance to labeled exemplars (k=3) |
| Train loop | Mark current frame → store vector |

---

## 3. Mental model

```
MicPcm ──► features ──┬──► baseline rules ──► label
                      │
                      └──► k-NN (if ≥3 exemplars)
```

---

## 4. Files

| File | Role |
| ---- | ---- |
| `index.tsx` | Composition |
| `Ex32Header.tsx` | Title copy |
| `hooks/useMicClassify.ts` | Live predict + mark |
| `lib/pcm/classify.ts` | Baseline + k-NN |
| `components/ClassifyCard.tsx` | UI |

---

## 5. Checklist

- [ ] Flash `es3c28p`; USB only
- [ ] Stream PCM — baseline labels look plausible
- [ ] Mark silence / speech / whistle a few times each
- [ ] Mode becomes `knn` and follows your labels better
- [ ] Clear training returns to baseline

**Previous:** [ex31 — Mic pitch](../../generated/react/ex31-mic-pitch/index.md)  
**Next:** [ex33 — Mic react](../../generated/react/ex33-mic-react/index.md)
