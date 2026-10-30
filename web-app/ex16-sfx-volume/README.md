# ex16 — SFX · volume & loops (Serial or BLE)

**Goal.** Carry `volume` and `loops` on `SfxCmd` (`0x84`) so the **next** play
uses those options — still one message type, richer fields than ex15.

---

## Learning outcomes

1. Distinguish play-time options (`SfxCmd`) from live DSP (`SfxParam`, ex17).
2. Set `volume` 1–100 and `loops` ≥ 0 on `encodeSfxPlay`.
3. Explain `loops = 0` → firmware default (often continuous for sirens).

```ts
await board.writeAcked(
  MSG_SFX_CMD,
  encodeSfxPlay(SFX_PRESET.BEEP, { volume: 40, loops: 3 }),
);
```

---

## Try it

[http://localhost:5174/ex16-sfx-volume/](http://localhost:5174/ex16-sfx-volume/)

- [ ] Louder Volume → louder Beep  
- [ ] Loops = 3 → Beep repeats three times  
- [ ] Alarm + Stop still works  

**Previous:** [ex15 — SFX play](../ex15-sfx-play/)  
**Next:** [ex17 — SFX params](../ex17-sfx-params/)
