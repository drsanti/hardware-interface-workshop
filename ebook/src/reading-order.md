# Reading order

Suggested path for a full class. Skip board-specific labs when your SKU lacks
the feature (see [Boards and capabilities](boards-and-caps.md)).

## 1. Flash once

1. [Flash firmware](flash-firmware.md) — pick `es3c28p` or `ws28p`
2. Confirm USB port; quit other serial monitors

## 2. Vanilla track (`web-app`, port 5174)

| Block | Labs | Focus |
|-------|------|--------|
| Browser fundamentals | ex00–ex09 | DOM, events, SVG/canvas, mic/speaker/camera APIs |
| Link | ex10–ex11 | Web Serial, Web Bluetooth, `BoardInfo` |
| Deep dive | [`@sdk`](sdk/index.md) | Session, frames, message IDs (optional but detailed) |
| Board I/O | ex12–ex20 | LED, SFX, mic (**es3c28p** for LED/mic) |

```text
cd web-app
vp install
vp dev
# open http://localhost:5174/ex00-hello/
```

## 3. React track (`demos`, port 5173)

| Block | Labs | Focus |
|-------|------|--------|
| React + connect | ex00–ex03 | Layout, Serial picker, board hello |
| LED / SFX / mic | ex04–ex15 | **es3c28p** path |
| Keys, battery, motion | ex16–ex25 | Keys/batt on both; IMU/RTC need **ws28p** |
| Host mic DSP | ex26–ex34 | FFT, spectrogram, classify, appliances |

```text
cd demos
vp install
vp dev
# enable one lab in src/App.tsx (import + <Route>)
```

Set `WORKSHOP_BOARD_ID` in `demos/src/lib/workshop.ts` to match the flashed image.

## 4. Critical wiring notes

- **Mic PCM** (`MicPcm` stream) is **USB Serial only** — not BLE (vanilla ex20, React mic wave / DSP labs).
- Gate UI with `CAP.*` / `boardHas()` — never assume LED or mic on `ws28p`.
- Exactly **one** React lab active at a time via `App.tsx`.
