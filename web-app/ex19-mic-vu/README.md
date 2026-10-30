# ex19 — Mic · VU + gain (Serial or BLE)

**Goal.** Turn `AudioLevel` into a **VU bar** with `levelToPercent`, then
send `MicCmd` **gain_pct** / **mute** while watching the meter.

Needs **`es3c28p`** (`CAP.MIC`).

---

## Learning outcomes

1. Map int16 amplitude → percent with a dBFS floor (speech-friendly).
2. Reuse `MicCmd` for `gainPct` and `mute` (not only enable).
3. Push current gain when enabling so the board is not stuck at a quiet default.

```ts
await board.writeAcked(MSG_MIC_CMD, encodeMicCmd({ enable: true, gainPct: 70 }));
await board.writeAcked(MSG_MIC_CMD, encodeMicCmd({ mute: true }));
const pct = levelToPercent(level.rms); // → bar width
```

---

## Try it

[http://localhost:5174/ex19-mic-vu/](http://localhost:5174/ex19-mic-vu/)

- [ ] Mic on → speak → rms bar moves  
- [ ] Raise Gain → Apply → same voice fills more of the meter  
- [ ] Mute → levels drop / stay quiet  

**Previous:** [ex18 — Mic hello](../ex18-mic-hello/)  
**Next:** [ex20 — Mic wave](../ex20-mic-wave/)
