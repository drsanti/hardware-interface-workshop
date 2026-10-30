# ex14 — LED · sliders (Serial or BLE)

**Goal.** Mix R / G / B and **intensity** with range inputs, send a solid
`LedFx` (`0x8e`) over USB or BLE, and contrast **live** `writeFrame` with
acked **Apply** (`writeAcked`).

Builds on [ex12 — LedFx presets](../ex12-led-writeacked/). Waves remain in
[ex13](../ex13-wave-cmd/).

---

## Learning outcomes

After this lab you should be able to:

1. Bind `<input type="range">` `input` events to protocol payloads.
2. Scale RGB by intensity in the browser (firmware solid ignores `intensity`).
3. Throttle live traffic (~80 ms) so slider drag does not flood the link.
4. Choose `writeFrame` (snappy) vs `writeAcked` (confirmed) for the same command.

---

## Theory

### Why scale intensity here?

`LedFx.intensity` is applied by firmware for **blink / fade / rainbow**. For
**solid**, the MCU writes `r,g,b` as-is. This lab computes:

```text
out = round(base * intensity / 255)   // per channel
```

then sends `encodeLedSolid(out)`.

### Live vs Apply

| Control | API          | Why                                      |
| ------- | ------------ | ---------------------------------------- |
| Live on | `writeFrame` | Fast while dragging; no wait for CmdAck  |
| Apply   | `writeAcked` | One shot; shows `rc` when the board acks |
| Off     | `writeAcked` | Confirmed dark                           |

Throttle: on each `input`, schedule at most one send every `LIVE_MS` (80).

---

## Files

| File         | Role                                |
| ------------ | ----------------------------------- |
| `index.html` | Sliders + Live / Apply / Off        |
| `ui.ts`      | DOM + preview paint                 |
| `main.ts`    | **Read this** — mix + send          |
| `styles.css` | Page look                           |

---

## Try it

1. Flash `es3c28p` prebuilt; open
   [http://localhost:5174/ex14-led-sliders/](http://localhost:5174/ex14-led-sliders/)
2. Connect USB or BLE → drag Red / Intensity with **Live** checked.
3. Uncheck Live, change color, click **Apply** — watch Last send `rc=0`.

### Checklist

- [ ] Swatch tracks sliders before connect (preview only)
- [ ] Live drag updates the physical LED smoothly
- [ ] Apply reports `writeAcked` + `rc`
- [ ] Off clears the LED

---

**Previous:** [ex13 — WaveCmd](../ex13-wave-cmd/)  
**Next:** [ex15 — SFX play](../ex15-sfx-play/)
