# ex34 — Sense appliance

**Goal:** one product loop — **classify** MicPcm, **BOOT** overrides mode,
**battery** gates SFX.

Needs **`es3c28p`** and **USB**.

Enable in [`src/App.tsx`](../../App.tsx): uncomment `Ex34SenseAppliance`
import + `<Route>`, comment the others.

---

## 1. Why this lab?

ex33 closes audio → actuators. This lab adds the other host sensors
students already know (key + battery) on the **same session**, so the
desk demo feels like a small appliance.

**Success:** Stream on → whistle lights green + Chime; SHORT toggles
React; LONG silence; low battery banner mutes SFX.

---

## 2. Mapping

| Input | Action |
| ----- | ------ |
| silence / speech / whistle / noise | same LED/SFX as ex33 |
| BOOT SHORT | toggle React |
| BOOT DOUBLE | Chime (blocked if low batt) |
| BOOT LONG | Stop + LED off + React off |
| Battery ≤ 25% | warn UI · mute SFX |

---

## 3. Mental model

```
MicPcm ──► class ──► (React?) ──► LedFx / SfxCmd
BOOT   ──► toggle / Chime / Stop
Batt   ──► gate SFX
```

One `useSerialSession` via `useMic` (+ `subscribe` for key/batt).

---

## 4. Files

| File | Role |
| ---- | ---- |
| `index.tsx` | Composition |
| `Ex34Header.tsx` | Title copy |
| `hooks/useSenseAppliance.ts` | Classify + key + batt + actuators |
| `components/SenseApplianceCard.tsx` | Mode + legends |
| `ClassifyCard` / `KeyEventCard` / `BatteryCard` | Shared panels |

---

## 5. Checklist

- [ ] Flash `es3c28p`; USB only
- [ ] Stream PCM · React on · whistle → green + Chime
- [ ] SHORT toggles React; LONG stops everything
- [ ] Optional: wait for batt packet; confirm SFX mute when ≤25%

**Previous:** [ex33 — Mic react](../ex33-mic-react/)
