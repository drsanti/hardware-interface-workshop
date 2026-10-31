# ex04 — RGB LED

<div class="ebook-run">

**Track:** `react` · **Project:** `demos` · **Port:** `5173`

```text
cd demos
vp install   # first time
vp dev
# enable ex04-rgb-led in demos/src/App.tsx (import + <Route>)
# match WORKSHOP_BOARD_ID in demos/src/lib/workshop.ts
```

<p class="ebook-source"><strong>Source:</strong> <code>demos/src/pages/ex04-rgb-led/README.md</code></p>

</div>


**Goal:** send the first **host → board** command: set the RGB LED color
(or turn it off) over the USB serial link.

Needs **`es3c28p`**. `ws28p` has no RGB LED — the UI explains that and
disables sends (`boardHas(CAP.LED)`).

Enable in [`src/App.tsx`](../../../../demos/src/App.tsx): uncomment `Ex04RgbLed`
import + `<Route>`, comment the others.

---

## 1. Learning objectives

| Idea            | In this exercise                                        |
| --------------- | ------------------------------------------------------- |
| Write stream    | Build a framed message and `writable.getWriter().write` |
| Command + ack | Board answers OK/error; preview may update from echo |
| Capability gate | Do not assume LED — check the board target              |
| Shared session  | One reader for all inbound frames (`useSerialSession`)  |
| Settle first    | Wait until `ready` before sending                       |

**Success:** Connect on `es3c28p`, pick Red/Green/Blue/White, see the
physical LED change **and stay** that color; Off turns it dark.

**Note:** On boot the board runs a color-wheel animation (looks like a
rainbow). A host LED command stops that animation so your color sticks.
Flash `robotos_serial_bridge` for `es3c28p` (not an rtos-labs image).

---

## 2. Before you start

1. Flash `firmware-prebuilt/es3c28p/`.
2. Set `WORKSHOP_BOARD_ID` to `es3c28p` in
   [`src/lib/workshop.ts`](../../../../demos/src/lib/workshop.ts).
3. Quit other serial apps; use Chrome/Edge on localhost.

---

## 3. What you should see

```
┌─────────────────────────────────────┐
│ ex04 · RGB LED                      │
│ Send a color to the board           │
├─────────────────────────────────────┤
│ Serial port           [ Connected ] │
├─────────────────────────────────────┤
│ RGB LED                             │
│            ( color swatch )         │
│  [Red] [Green] [Blue] [White]       │
│            [ Off ]                  │
└─────────────────────────────────────┘
```

---

## 4. Mental model

```
┌────────────┐  LED effect cmd ┌──────────────┐
│ LedControl │ ──────────────► │ useSerialSession│
│ presets    │                 │ writeFrame      │
└────────────┘                 └───────┬─────────┘
                                       │ USB
                                       ▼
                               ┌──────────────┐
                               │    Board     │
                               │  RGB LED     │
                               └──────┬───────┘
                                      │ LED shadow (optional)
                                      ▼
                               ┌──────────────┐
                               │ swatch update│
                               └──────────────┘
```

---

## 5. Sequence — set color

```mermaid
sequenceDiagram
  actor You
  participant Card as LedControlCard
  participant Hook as useLedControl
  participant Link as useSerialSession
  participant Board as Board

  You->>Card: click Green
  Card->>Hook: setColor(rgb)
  Hook->>Link: writeFrame(LED command)
  Link->>Board: USB framed bytes
  Board-->>Board: drive WS2812
  Board-->>Link: LED shadow (optional)
  Link-->>Hook: echoed rgb
  Hook-->>Card: update swatch
```

---

## 6. Files

| File             | Role          |
| ---------------- | ------------- |
| `index.tsx`      | Student entry |
| `Ex04Header.tsx` | Title + copy  |
| `README.md`      | This guide    |

| Shared                          | Role                       |
| ------------------------------- | -------------------------- |
| `hooks/useLedControl.ts`        | Connect + send color / off |
| `hooks/useSerialSession.ts`     | Shared read/write session  |
| `lib/wire/led.ts`               | Encode/decode LED payloads |
| `components/LedControlCard.tsx` | Presets + off UI           |

---

## 7. Checklist

- [ ] Target is `es3c28p` (LED supported)
- [ ] Connect → wait until Ready
- [ ] Preset colors change the physical LED
- [ ] Off turns the LED dark
- [ ] On `ws28p`, controls stay disabled with a clear message

**Previous:** [ex03 — Board hello](../../generated/react/ex03-board-hello/index.md)  
**Next:** [ex05 — LED studio](../../generated/react/ex05-led-studio/index.md) — sliders + Blink / Fade / Rainbow
