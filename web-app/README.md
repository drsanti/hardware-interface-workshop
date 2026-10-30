# web-app — Vanilla track (Vite+)

Beginner path: **HTML → CSS → TypeScript** in the browser, before React
and Web Serial.

This folder is its **own Vite+ project**. Run `vp` from here.

Sibling: [`../demos/`](../demos/) (React board labs on port 5173).

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
| [http://localhost:5174/ex12-led-writeacked/](http://localhost:5174/ex12-led-writeacked/)       | LED writeAcked     |

React demos: `cd ../demos` → `vp dev` → port **5173**.

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

Add the next lab as `exNN-…/index.html` + `styles.css` + `main.ts`, link it
from [`index.html`](index.html), and add the HTML path to
`build.rollupOptions.input` in [`vite.config.ts`](vite.config.ts).

## Board SDK

[`sdk/`](sdk/) is the vanilla library for **Web Serial** + **Web Bluetooth**
(same wire as `demos/`). Import as `@sdk`:

```ts
import { BoardSession, encodeLedSolid, MSG_LED_FX } from "@sdk";
```

See [`sdk/README.md`](sdk/README.md).

## Conventions

- One exercise = one folder with its own HTML/CSS/TS.
- Use `.ts` with `<script type="module" src="./main.ts">`.
- Keep comments short and teachy.
- Board link code lives in `sdk/` — exercises stay thin.

## Suggested next labs (not built yet)

1. **ex13** — SFX play / stop via `writeAcked` (Serial or BLE)
