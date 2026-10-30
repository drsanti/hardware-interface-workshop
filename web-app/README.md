# web-app — Vanilla track (Vite+)

Beginner path: **HTML → CSS → TypeScript** in the browser, before React
and Web Serial. Each exercise is a small multi-page app entry built with Vite+.

This folder is its **own Vite+ project**. Run `vp` from here.

Sibling: [`../demos/`](../demos/) (React board labs on port 5173).

---

## Overview

The vanilla track teaches browser fundamentals first (DOM, events, canvas,
Web Audio, camera), then **board I/O** through a shared [`sdk/`](sdk/):

- **ex10–11** — connect USB Serial or Web Bluetooth; read `BoardInfo`.
- **ex12–14** — RGB LED: `LedFx`, `WaveCmd`, live sliders.
- **ex15–17** — speaker SFX: `SfxCmd`, volume/loops, live `SfxParam`.
- **ex18–20** — microphone on **es3c28p**: levels (USB/BLE), PCM scope (USB).

Wire format and helpers match the React demos; only the UI stack differs.

---

## Prerequisites

- Node.js and the workshop **Vite+ CLI** (`vp`) — see repo root docs.
- Chromium-class browser with **Web Serial** and/or **Web Bluetooth** where noted.
- Flashed board from [`../firmware-prebuilt/`](../firmware-prebuilt/):
  - LED + SFX labs: **es3c28p** or **ws28p** (speaker on both).
  - Mic labs (ex18–20): **es3c28p** only (`CAP.MIC`).

---

## Run

```bash
cd hardware-interface-workshop/web-app
vp install         # first time
vp dev             # http://localhost:5174/
```

| URL                                                                                            | What               |
| ---------------------------------------------------------------------------------------------- | ------------------ |
| [http://localhost:5174/](http://localhost:5174/)                                               | Hub                |
| [http://localhost:5174/ex00-hello/](http://localhost:5174/ex00-hello/)                         | Hello, page        |
| [http://localhost:5174/ex01-dynamic-elements/](http://localhost:5174/ex01-dynamic-elements/)   | Dynamic elements   |
| [http://localhost:5174/ex02-dynamic-style/](http://localhost:5174/ex02-dynamic-style/)         | Dynamic style      |
| [http://localhost:5174/ex03-form-events/](http://localhost:5174/ex03-form-events/)             | Form events        |
| [http://localhost:5174/ex04-keyboard-pointer/](http://localhost:5174/ex04-keyboard-pointer/)   | Keyboard + pointer |
| [http://localhost:5174/ex05-svg-draw/](http://localhost:5174/ex05-svg-draw/)                   | SVG draw           |
| [http://localhost:5174/ex06-canvas-draw/](http://localhost:5174/ex06-canvas-draw/)             | Canvas draw        |
| [http://localhost:5174/ex07-web-audio-mic/](http://localhost:5174/ex07-web-audio-mic/)         | Web Audio mic      |
| [http://localhost:5174/ex08-web-audio-speaker/](http://localhost:5174/ex08-web-audio-speaker/) | Web Audio speaker  |
| [http://localhost:5174/ex09-web-video-camera/](http://localhost:5174/ex09-web-video-camera/)   | Web video camera   |
| [http://localhost:5174/ex10-web-serial/](http://localhost:5174/ex10-web-serial/)               | Web Serial         |
| [http://localhost:5174/ex11-web-bluetooth/](http://localhost:5174/ex11-web-bluetooth/)         | Web Bluetooth      |
| [http://localhost:5174/ex12-led-writeacked/](http://localhost:5174/ex12-led-writeacked/)       | LED LedFx          |
| [http://localhost:5174/ex13-wave-cmd/](http://localhost:5174/ex13-wave-cmd/)                   | LED WaveCmd        |
| [http://localhost:5174/ex14-led-sliders/](http://localhost:5174/ex14-led-sliders/)             | LED sliders        |
| [http://localhost:5174/ex15-sfx-play/](http://localhost:5174/ex15-sfx-play/)                   | SFX play           |
| [http://localhost:5174/ex16-sfx-volume/](http://localhost:5174/ex16-sfx-volume/)               | SFX volume         |
| [http://localhost:5174/ex17-sfx-params/](http://localhost:5174/ex17-sfx-params/)               | SFX params         |
| [http://localhost:5174/ex18-mic-hello/](http://localhost:5174/ex18-mic-hello/)                 | Mic hello          |
| [http://localhost:5174/ex19-mic-vu/](http://localhost:5174/ex19-mic-vu/)                       | Mic VU             |
| [http://localhost:5174/ex20-mic-wave/](http://localhost:5174/ex20-mic-wave/)                   | Mic wave (USB)     |

React demos: `cd ../demos` → `vp dev` → port **5173**.

---

## Exercises

| Folder                                              | Focus                                               |
| --------------------------------------------------- | --------------------------------------------------- |
| [`ex00-hello`](ex00-hello/)                         | Page anatomy: HTML structure, CSS look, TS click    |
| [`ex01-dynamic-elements`](ex01-dynamic-elements/)   | Build UI with `createElement` / `append` / `remove` |
| [`ex02-dynamic-style`](ex02-dynamic-style/)         | `setInterval` → params → `element.style`            |
| [`ex03-form-events`](ex03-form-events/)             | `input` / `change` / `submit` + `preventDefault`    |
| [`ex04-keyboard-pointer`](ex04-keyboard-pointer/)   | `keydown` + `pointerdown` on a stage                |
| [`ex05-svg-draw`](ex05-svg-draw/)                   | SVG: `createElementNS` + `polyline`                 |
| [`ex06-canvas-draw`](ex06-canvas-draw/)             | Canvas 2D: `lineTo` / `stroke`                      |
| [`ex07-web-audio-mic`](ex07-web-audio-mic/)         | Mic: `getUserMedia` + `AnalyserNode`                |
| [`ex08-web-audio-speaker`](ex08-web-audio-speaker/) | Speaker: `OscillatorNode` → destination             |
| [`ex09-web-video-camera`](ex09-web-video-camera/)   | Camera: `getUserMedia` + `video.srcObject`          |
| [`ex10-web-serial`](ex10-web-serial/)               | USB: `BoardSession.connectSerial` + BoardInfo       |
| [`ex11-web-bluetooth`](ex11-web-bluetooth/)         | BLE: `BoardSession.connectBle` + BoardInfo          |
| [`ex12-led-writeacked`](ex12-led-writeacked/)       | Serial *or* BLE: `writeAcked` + `LedFx`             |
| [`ex13-wave-cmd`](ex13-wave-cmd/)                   | Serial *or* BLE: `writeAcked` + `WaveCmd`           |
| [`ex14-led-sliders`](ex14-led-sliders/)             | Serial *or* BLE: RGB + intensity sliders            |
| [`ex15-sfx-play`](ex15-sfx-play/)                   | Serial *or* BLE: `SfxCmd` play / stop               |
| [`ex16-sfx-volume`](ex16-sfx-volume/)               | Serial *or* BLE: volume + loops on play             |
| [`ex17-sfx-params`](ex17-sfx-params/)               | Serial *or* BLE: live `SfxParam` knobs              |
| [`ex18-mic-hello`](ex18-mic-hello/)                 | Serial *or* BLE: `MicCmd` + `AudioLevel`            |
| [`ex19-mic-vu`](ex19-mic-vu/)                       | Serial *or* BLE: VU bar + gain / mute               |
| [`ex20-mic-wave`](ex20-mic-wave/)                   | USB Serial: `MicPcm` canvas waveform                |

Per-lab READMEs (ex12+) include theory, message maps, and try-it checklists.

Add the next lab as `exNN-…/index.html` + `styles.css` + `main.ts`, link it
from [`index.html`](index.html), and add the HTML path to
`build.rollupOptions.input` in [`vite.config.ts`](vite.config.ts).

---

## Board SDK

[`sdk/`](sdk/) is the vanilla library for **Web Serial** + **Web Bluetooth**
(same wire as `demos/`). Import as `@sdk`:

```ts
import { BoardSession, encodeLedSolid, MSG_LED_FX } from "@sdk";
```

See [`sdk/README.md`](sdk/README.md) for message IDs, caps, and encoders.

---

## Conventions

- One exercise = one folder with its own HTML/CSS/TS (often split `ui.ts` for DOM).
- Use `.ts` with `<script type="module" src="./main.ts">`.
- Board link code lives in `sdk/` — exercises stay thin; read each lab’s `main.ts`.
- **Actuator commands** (LED FX, SFX play/stop, mic enable): prefer `writeAcked`.
- **Live knobs** (LED color drag, SFX params): `writeFrame` with ~80 ms debounce.
- **Capabilities**: gate LED on `CAP.LED`, mic on `CAP.MIC`; SFX speaker needs no cap bit in these labs.
- Keep comments short and teachy; link **Previous / Next** at the bottom of lab READMEs.

---

## Suggested next labs (not built yet)

1. **ex21** — SFX melody upload (`SfxProg` `0x8d`) *(optional)*
2. **ex22** — Mic mini-studio (combine 18–20) *(optional)*
