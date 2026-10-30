# ex17 — SFX · live params (Serial or BLE)

**Goal.** Change a **running** sound with `SfxParam` (`MSG_SFX_PARAM` `0x85`) —
Master volume, Echo mix, Release — without sending another play.

---

## Learning outcomes

1. Contrast `SfxCmd` (trigger) vs `SfxParam` (live DSP / codec).
2. Use stage / field pairs the firmware understands.
3. Throttle live `writeFrame` while dragging sliders.

### Stage map (this lab)

| Control   | Stage  | Field | Value                         |
| --------- | ------ | ----- | ----------------------------- |
| Master %  | `0xFF` | `0`   | 1–100 (codec volume)          |
| Echo mix  | `5`    | `1`   | 0.0–1.0 (delay wet mix)       |
| Release   | `4`    | `3`   | ms (ADSR release)             |

```ts
await board.writeFrame(MSG_SFX_PARAM, encodeSfxParam(0xff, 0, 40));
await board.writeFrame(MSG_SFX_PARAM, encodeSfxParam(5, 1, 0.3));
await board.writeFrame(MSG_SFX_PARAM, encodeSfxParam(4, 3, 200));
```

---

## Try it

[http://localhost:5174/ex17-sfx-params/](http://localhost:5174/ex17-sfx-params/)

- [ ] Start Alarm → drag Echo — hear space change  
- [ ] Release longer → softer tails  
- [ ] Stop silences the loop  

**Previous:** [ex16 — SFX volume](../ex16-sfx-volume/)  
**Next:** custom melody (`SfxProg`) — optional later
