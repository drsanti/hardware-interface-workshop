# ex33 — Mic react

<div class="ebook-run">

**Track:** `react` · **Project:** `demos` · **Port:** `5173`

```text
cd demos
vp install   # first time
vp dev
# enable ex33-mic-react in demos/src/App.tsx (import + <Route>)
# match WORKSHOP_BOARD_ID in demos/src/lib/workshop.ts
```

<p class="ebook-source"><strong>Source:</strong> <code>demos/src/pages/ex33-mic-react/README.md</code></p>

</div>


**Goal:** close the loop — **classify** MicPcm, then drive **LED / SFX**
on the board when the class stays stable.

Needs **`es3c28p`** and **USB**.

Enable in [`src/App.tsx`](../../../../demos/src/App.tsx): uncomment `Ex33MicReact`
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

**Previous:** [ex32 — Mic classify](../../generated/react/ex32-mic-classify/index.md)  
**Next:** [ex34 — Sense appliance](../../generated/react/ex34-sense-appliance/index.md)
