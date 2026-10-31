# ex05 — LED studio

<div class="ebook-run">

**Track:** `react` · **Project:** `demos` · **Port:** `5173`

```text
cd demos
vp install   # first time
vp dev
# enable ex05-led-studio in demos/src/App.tsx (import + <Route>)
# match WORKSHOP_BOARD_ID in demos/src/lib/workshop.ts
```

<p class="ebook-source"><strong>Source:</strong> <code>demos/src/pages/ex05-led-studio/README.md</code></p>

</div>


**Goal:** go beyond one-tap presets — **mix RGB with sliders**, pick richer
solid swatches, and start **LedFx motion** (Blink / Fade / Rainbow).

Needs **`es3c28p`**. `ws28p` has no RGB LED — the UI explains that and
hides controls (`boardHas(CAP.LED)`).

Enable in [`src/App.tsx`](../../../../demos/src/App.tsx): uncomment `Ex05LedStudio`
import + `<Route>`, comment the others.

---

## 1. Learning objectives

| Idea              | In this exercise                                           |
| ----------------- | ---------------------------------------------------------- |
| Continuous values | Sliders send solid `LedFx` as you drag (debounced)         |
| Same wire type    | Solid and motion share `msg_type` 0x8e (`LedFx`)           |
| Effect enum       | `0=off 1=solid 2=blink 3=fade 4=rainbow`                   |
| Ack under load    | Fast slider moves replace in-flight commands cleanly       |
| Capability gate   | Do not assume LED — check the board target                 |

**Success:** Connect on `es3c28p`, drag Red/Green/Blue and see the LED
track; Blink / Fade use your mix; Rainbow runs a hue cycle; Off stops it.

---

## 2. Before you start

1. Flash `firmware-prebuilt/es3c28p/` (`robotos_serial_bridge`).
2. Set `WORKSHOP_BOARD_ID` to `es3c28p` in
   [`src/lib/workshop.ts`](../../../../demos/src/lib/workshop.ts).
3. Finish [ex04](../../generated/react/ex04-rgb-led/index.md) first (simple solid presets).
4. Quit other serial apps; use Chrome/Edge on localhost.

---

## 3. What you should see

```
┌─────────────────────────────────────┐
│ ex05 · LED studio                   │
│ Mix colors and play effects         │
├─────────────────────────────────────┤
│ Serial port           [ Connected ] │
├─────────────────────────────────────┤
│ LED studio                          │
│            ( color swatch )         │
│  Red   ════⬤══════════════  255    │
│  Green ══════⬤════════════   64    │
│  Blue  ⬤══════════════════    0    │
│  [Red][Green]…[Cyan][Amber]…        │
│  [ Blink ] [ Fade ] [ Rainbow ]     │
│            [ Off ]                  │
└─────────────────────────────────────┘
```

Controls stay **hidden** until the port is open **and** settled.

---

## 4. Mental model

```
┌──────────────┐  solid / fx   ┌──────────────────┐
│ LedStudioCard│ ────────────► │ useLedStudio     │
│ sliders+fx   │               │ debounce + ack   │
└──────────────┘               └────────┬─────────┘
                                        │ writeFrame(0x8e)
                                        ▼
                               ┌──────────────────┐
                               │      Board       │
                               │  rb_fx_led_*     │
                               └────────┬─────────┘
                                        │ LedState / CmdAck
                                        ▼
                               ┌──────────────────┐
                               │ swatch + status  │
                               └──────────────────┘
```

---

## 5. Sequence — drag a slider

```mermaid
sequenceDiagram
  actor You
  participant Card as LedStudioCard
  participant Hook as useLedStudio
  participant Link as useSerialSession
  participant Board as Board

  You->>Card: drag Green slider
  Card->>Hook: setChannel(g, value)
  Note over Hook: update local rgb<br/>debounce ~120ms
  Hook->>Link: writeFrame(LedFx solid)
  Link->>Board: USB framed bytes
  Board-->>Board: rb_fx_led_solid
  Board-->>Link: CmdAck + LedState
  Link-->>Hook: ack / echo
  Hook-->>Card: status + swatch
```

---

## 6. Files

| File             | Role          |
| ---------------- | ------------- |
| `index.tsx`      | Student entry |
| `Ex05Header.tsx` | Title + copy  |
| `README.md`      | This guide    |

| Shared                          | Role                            |
| ------------------------------- | ------------------------------- |
| `hooks/useLedStudio.ts`         | Sliders, presets, LedFx + ack   |
| `hooks/useSerialSession.ts`     | Shared read/write session       |
| `lib/wire/led.ts`               | Encode solid / blink / fade / … |
| `components/LedStudioCard.tsx`  | Studio UI                       |

---

## 7. Checklist

- [ ] Target is `es3c28p` (LED supported)
- [ ] Connect → wait until controls appear
- [ ] Sliders change the physical LED (after a short debounce)
- [ ] Solid swatches jump the mix and LED
- [ ] Blink / Fade use the current mix; Rainbow cycles hues
- [ ] Off turns the LED dark
- [ ] On `ws28p`, controls stay hidden with a clear message

**Previous:** [ex04 — RGB LED](../../generated/react/ex04-rgb-led/index.md)  
**Next:** [ex06 — SFX play](../../generated/react/ex06-sfx-play/index.md) — board speaker presets
