# ex13 — Gain and mute

**Goal:** send `MicCmd` **gain_pct** and **mute** while watching the VU
react.

Needs **`es3c28p`**.

Enable in [`src/App.tsx`](../../App.tsx): uncomment `Ex13MicGain`
import + `<Route>`, comment the others.

---

## 1. Why this lab?

ex11–12 only enabled capture. Here the host **configures** the mic:
gain (PGA / digital path) and mute — still optional fields on the same
`MicCmd` message.

**Success:** Mic on + speak. Raise **Gain** → VU climbs for the same
voice. **Mute** → level drops / stays quiet; **Unmute** restores.

---

## 2. Learning objectives

| Idea | In this exercise |
| ---- | ---------------- |
| Optional fields | Only send the params you change |
| `gain_pct` | 0–100 |
| `mute` | Soft silence without disabling capture |
| Apply on release | Slider commits gain on mouse/touch up (or % button) |

---

## 3. Before you start

1. Flash `firmware-prebuilt/es3c28p/`.
2. Finish [ex12](../ex12-mic-vu/).

---

## 4. What you do

1. Connect → **Mic on**.
2. Speak at constant distance.
3. Drag **Gain**, release — apply; VU should change.
4. Tap **Mute** / **Unmute**.
5. **Mic off**.

---

## 5. Mental model

```
MicCmd{ gain_pct } ──► board PGA / gain
MicCmd{ mute }     ──► silence tap (capture may stay enabled)
AudioLevel         ──► VU still updates (muted ≈ low)
```

```mermaid
sequenceDiagram
  actor You
  participant Hook as useMic
  participant Board
  You->>Hook: applyGain(80)
  Hook->>Board: MicCmd{gain_pct:80}
  Board-->>Hook: CmdAck
  Board-->>Hook: AudioLevel (louder rms)
```

---

## 6. Files

| File | Role |
| ---- | ---- |
| `index.tsx` | `features={{ vu: true, gain: true }}` |
| `useMic.ts` | `applyGain` / `setMute` |

---

## 7. Checklist

- [ ] Higher gain → bigger VU for same speech
- [ ] Mute clearly quiets the meter
- [ ] Unmute restores response

**Previous:** [ex12 — Mic VU](../ex12-mic-vu/)  
**Next:** [ex14 — Mic wave](../ex14-mic-wave/)
