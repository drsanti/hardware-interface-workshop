# ex33 — Mic react

**Goal:** close the loop — **classify** MicPcm, then drive **LED / SFX**
on the board when the class stays stable.

Needs **`es3c28p`** and **USB**.

Enable in [`src/App.tsx`](../../App.tsx): uncomment `Ex33MicReact`
import + `<Route>`, comment the others.

---

## 1. Why this lab?

ex32 stops at a label on the host. This capstone sends that label back
to the **actuators** students already know (LED + speaker).

**Success:** Stream on → quiet → LED off; talk → blue; whistle → green
+ Chime.

---

## 2. Mapping

| Class | LED | SFX |
| ----- | --- | --- |
| silence | off | — |
| speech | blue | — |
| whistle | green | Chime (cooldown) |
| noise | amber | rare Beep |

Debounce ≈ 4 feature hops (~0.25 s) so flicker doesn’t spam the board.

---

## 3. Mental model

```
MicPcm ──► features ──► class ──► (stable?) ──► LedFx / SfxCmd
```

---

## 4. Files

| File | Role |
| ---- | ---- |
| `index.tsx` | Composition |
| `Ex33Header.tsx` | Title copy |
| `hooks/useMicReact.ts` | Classify + fire actuators |
| `components/ReactCard.tsx` | Toggle + legend |
| `components/ClassifyCard.tsx` | Shared with ex32 |

---

## 5. Checklist

- [ ] Flash `es3c28p`; USB only
- [ ] Stream PCM · React on
- [ ] Silence / speech / whistle match the table
- [ ] Optional: mark k-NN examples to tighten labels

**Previous:** [ex32 — Mic classify](../ex32-mic-classify/)  
**Next:** [ex34 — Sense appliance](../ex34-sense-appliance/)
