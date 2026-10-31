<div align="center">

# hardware-interface-workshop

**Browser workshop** for ND03 / robotos courses — talk to Cronos boards over
**Web Serial** and **Web Bluetooth**, from vanilla HTML/TS to React labs.

[![Platform](https://img.shields.io/badge/platform-Web%20Serial%20%7C%20Web%20Bluetooth-blue.svg)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API)
[![Runtime](https://img.shields.io/badge/runtime-Chrome%20%7C%20Edge-informational.svg)](https://developer.chrome.com/docs/capabilities/serial)
[![Stack](https://img.shields.io/badge/stack-Vite%2B%20%7C%20TypeScript-brightgreen.svg)](https://viteplus.dev/)
[![Board](https://img.shields.io/badge/board-es3c28p%20%7C%20ws28p-informational.svg)](firmware-prebuilt/README.md)
[![GitHub release](https://img.shields.io/github/v/release/drsanti/hardware-interface-workshop?include_prereleases&sort=semver)](https://github.com/drsanti/hardware-interface-workshop/releases)
[![Last commit](https://img.shields.io/github/last-commit/drsanti/hardware-interface-workshop)](https://github.com/drsanti/hardware-interface-workshop/commits/main)

[Quick start](#quick-start) ·
[Tracks](#workshop-tracks) ·
[Boards](#supported-boards) ·
[Docs](#documentation) ·
[Flash](#flash-firmware)

</div>

---

## Table of contents

- [Overview](#overview)
- [Features](#features)
- [Repository layout](#repository-layout)
- [Supported boards](#supported-boards)
- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [Flash firmware](#flash-firmware)
- [Workshop tracks](#workshop-tracks)
- [Documentation](#documentation)
- [Firmware co-development](#firmware-co-development)
- [Naming](#naming)

---

## Overview

Students build **host-side** labs in the browser: open a USB or BLE link,
decode `BoardInfo`, then drive LED, SFX, mic, keys, battery, and IMU —
without the `robotos` host SDK.

Two Vite+ projects share one flashable image tree under
[`firmware-prebuilt/`](firmware-prebuilt/). Flash once, then pick a track.

| Track | Role | Port |
|-------|------|------|
| [`web-app/`](web-app/) | Beginner HTML / CSS / TypeScript + [`sdk/`](web-app/sdk/) | **5174** |
| [`demos/`](demos/) | React labs: Serial/BLE → LED, SFX, mic, IMU, … | **5173** |
| [`firmware-prebuilt/`](firmware-prebuilt/) | Flashable board images (`es3c28p`, `ws28p`) | — |

---

## Features

- **Two progressive tracks** — vanilla MPA (`web-app`) then React catalog
  (`demos`)
- **Shared wire codecs** — COBS + protobuf; vanilla `@sdk` mirrors demos
- **Web Serial + Web Bluetooth** — same board messages over USB or BLE
- **No ESP-IDF for students** — flash with in-repo `rbdev flash-bin` (+ `esptool`)
- **Two boards** — Ternion **es3c28p** (LED + mic) and Waveshare **ws28p**
  (IMU + RTC)
- **Capability gating** — labs use `CAP.*` / `boardHas()`; never assume hardware

---

## Repository layout

```text
hardware-interface-workshop/
├── web-app/                 # Vanilla track — Vite+ MPA (port 5174)
│   ├── sdk/                 # BoardSession + wire codecs (@sdk)
│   └── ex00-…ex20-…/        # One folder per lab
├── demos/                   # React track — Vite+ SPA (port 5173)
│   └── src/pages/ex00-…ex34-…
├── firmware-prebuilt/       # Flash bins + rbdev CLI
│   ├── es3c28p/
│   ├── ws28p/
│   └── rbdev/               # windows | mac | linux
└── README.md
```

---

## Supported boards

| Board | Product | Caps focus |
|-------|---------|------------|
| **`es3c28p`** (default for LED/mic) | Ternion ESP32-S3 | RGB LED + mic (`caps ≈ 0x33`) |
| **`ws28p`** | Waveshare ESP32-S3-Touch-LCD-2.8 | IMU + RTC (`caps ≈ 0x3c`; **no** LED/mic) |

| Feature | `es3c28p` | `ws28p` |
|---------|-----------|---------|
| RGB LED | yes | no |
| Microphone | yes | no |
| Motion (IMU) | no | yes |
| Clock (RTC) | no | yes |
| Speaker / keys / battery | yes | yes |

Match the flash folder to the lab’s board notes. In React demos, also set
`WORKSHOP_BOARD_ID` in [`demos/src/lib/workshop.ts`](demos/src/lib/workshop.ts).

---

## Prerequisites

| Need | Notes |
|------|--------|
| Node.js **20+** | Vite+ / `vp` |
| Chrome or Edge | Web Serial + Web Bluetooth |
| Secure context | `localhost` or HTTPS |
| Python + `esptool` | Flash only — `pip install --user esptool` |
| Board | `es3c28p` or `ws28p`, flashed from `firmware-prebuilt/` |

No ESP-IDF required for students.

---

## Quick start

```powershell
git clone https://github.com/drsanti/hardware-interface-workshop.git
cd hardware-interface-workshop
```

### 1. Flash the board (once)

```powershell
# Once per PowerShell window (avoids "not digitally signed"):
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

cd firmware-prebuilt
python -m pip install --user esptool
.\rb config --port COMx --board es3c28p   # or ws28p — YOUR port
.\rb flash-bin
```

```bash
cd firmware-prebuilt
python3 -m pip install --user esptool
chmod +x rbdev/mac/rbdev rbdev/linux/rbdev rb 2>/dev/null || true
./rb config --port /dev/cu.usbmodemXXXX --board es3c28p
./rb flash-bin
```

### 2. Run a track

**Beginner (vanilla)** — port **5174**

```bash
cd web-app
vp install
vp dev          # http://localhost:5174/
```

**Board demos (React)** — port **5173**

```bash
cd demos
vp install
vp dev          # http://localhost:5173/
```

<details>
<summary><strong>Serial port names</strong></summary>

| OS | Typical device |
|----|----------------|
| Windows | `COM3`, `COM17`, … (Device Manager → Ports) |
| macOS | `/dev/cu.usbmodem*` or `/dev/cu.usbserial*` |
| Linux | `/dev/ttyACM0` or `/dev/ttyUSB0` |

Quit any serial monitor before flashing or opening Web Serial.

</details>

---

## Flash firmware

Students flash **prebuilt bins** — no IDF project in this repo.

| Doc | Role |
|-----|------|
| [`firmware-prebuilt/README.md`](firmware-prebuilt/README.md) | Boards, `flash-bin`, esptool fallback |
| [`firmware-prebuilt/rbdev/README.md`](firmware-prebuilt/rbdev/README.md) | `rb` CLI — doctor, config, flash |

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
cd firmware-prebuilt
.\rb doctor
.\rb config --port COMx --board es3c28p
.\rb flash-bin
```

Firmware source (instructors): [`../firmware-esp32-s3-dev`](../firmware-esp32-s3-dev).

---

## Workshop tracks

### Vanilla track — HTML / CSS / TypeScript

| | |
|--|--|
| Path | [`web-app/`](web-app/) |
| Dev | `vp dev` → [http://localhost:5174/](http://localhost:5174/) |
| SDK | [`web-app/sdk/`](web-app/sdk/) — import as `@sdk` |
| Index | [`web-app/README.md`](web-app/README.md) |

```
ex00 Hello → … → ex09 media APIs → ex10 Serial → ex11 BLE
  → ex12–14 LED → ex15–17 SFX → ex18–20 Mic
```

<details>
<summary><strong>Full vanilla catalog (ex00–ex20)</strong></summary>

| Ex | Focus |
|----|--------|
| [ex00-hello](web-app/ex00-hello/) | Page anatomy: HTML, CSS, TS click |
| [ex01-dynamic-elements](web-app/ex01-dynamic-elements/) | `createElement` / `append` / `remove` |
| [ex02-dynamic-style](web-app/ex02-dynamic-style/) | `setInterval` → `element.style` |
| [ex03-form-events](web-app/ex03-form-events/) | `input` / `change` / `submit` |
| [ex04-keyboard-pointer](web-app/ex04-keyboard-pointer/) | `keydown` + `pointerdown` |
| [ex05-svg-draw](web-app/ex05-svg-draw/) | SVG `polyline` |
| [ex06-canvas-draw](web-app/ex06-canvas-draw/) | Canvas 2D stroke |
| [ex07-web-audio-mic](web-app/ex07-web-audio-mic/) | Browser mic + `AnalyserNode` |
| [ex08-web-audio-speaker](web-app/ex08-web-audio-speaker/) | `OscillatorNode` → speakers |
| [ex09-web-video-camera](web-app/ex09-web-video-camera/) | `getUserMedia` + `<video>` |
| [ex10-web-serial](web-app/ex10-web-serial/) | `BoardSession.connectSerial` + BoardInfo |
| [ex11-web-bluetooth](web-app/ex11-web-bluetooth/) | `BoardSession.connectBle` + BoardInfo |
| [ex12-led-writeacked](web-app/ex12-led-writeacked/) | `writeAcked` + `LedFx` |
| [ex13-wave-cmd](web-app/ex13-wave-cmd/) | `WaveCmd` oscillators |
| [ex14-led-sliders](web-app/ex14-led-sliders/) | RGB + intensity live `writeFrame` |
| [ex15-sfx-play](web-app/ex15-sfx-play/) | `SfxCmd` play / stop |
| [ex16-sfx-volume](web-app/ex16-sfx-volume/) | Volume + loops on play |
| [ex17-sfx-params](web-app/ex17-sfx-params/) | Live `SfxParam` knobs |
| [ex18-mic-hello](web-app/ex18-mic-hello/) | `MicCmd` + `AudioLevel` |
| [ex19-mic-vu](web-app/ex19-mic-vu/) | VU bar + gain / mute |
| [ex20-mic-wave](web-app/ex20-mic-wave/) | USB `MicPcm` canvas scope |

</details>

### React demos — board feature catalog

| | |
|--|--|
| Path | [`demos/`](demos/) |
| Dev | `vp dev` → [http://localhost:5173/](http://localhost:5173/) |
| Switch lab | Comment / uncomment one route in `src/App.tsx` |
| Index | [`demos/README.md`](demos/README.md) |

```
ex00 Overview → ex02–03 link → ex04–05 LED → ex06–10 SFX
  → ex11–15 Mic → ex16–25 keys/batt/IMU/appliance → ex26–34 mic DSP
```

<details>
<summary><strong>Full React catalog (ex00–ex34)</strong></summary>

| Ex | Focus |
|----|--------|
| [ex00-getting-started](demos/src/pages/ex00-getting-started/) | Overview + browser Serial/BLE check |
| [ex01-react-component](demos/src/pages/ex01-react-component/) | React props / state warm-up |
| [ex02-web-serial-picker](demos/src/pages/ex02-web-serial-picker/) | USB / BLE connect |
| [ex03-board-hello](demos/src/pages/ex03-board-hello/) | BoardInfo identity |
| [ex04-rgb-led](demos/src/pages/ex04-rgb-led/) | Solid RGB over Serial |
| [ex05-led-studio](demos/src/pages/ex05-led-studio/) | Sliders + LedFx presets |
| [ex06-sfx-play](demos/src/pages/ex06-sfx-play/) | SFX presets + stop |
| [ex07–ex10](demos/src/pages/ex07-sfx-volume/) | Volume · params · melody · studio |
| [ex11–ex15](demos/src/pages/ex11-mic-hello/) | Mic hello → VU → gain → wave → studio |
| [ex16–ex25](demos/src/pages/ex16-key-hello/) | Keys · battery · IMU · RTC · appliances · caps |
| [ex26–ex34](demos/src/pages/ex26-mic-fft/) | FFT · spectrogram · record · filter · classify · react |

</details>

---

## Documentation

| Doc | Audience |
|-----|----------|
| [`ebook/book/`](ebook/book/index.html) | HTML labs ebook — both tracks + `@sdk` (generated from README labsheets) |
| [`web-app/README.md`](web-app/README.md) | Vanilla hub, exercise list, conventions |
| [`web-app/sdk/README.md`](web-app/sdk/README.md) | `BoardSession`, wire codecs, message IDs |
| [`demos/README.md`](demos/README.md) | React stack, board matrix, lab index |
| [`firmware-prebuilt/README.md`](firmware-prebuilt/README.md) | Flash bins + ports |
| [`firmware-prebuilt/rbdev/README.md`](firmware-prebuilt/rbdev/README.md) | Student flash CLI (`flash-bin`) |
| Sibling [`firmware-esp32-s3-workshop/rbdev-gui`](https://github.com/drsanti/firmware-esp32-s3-workshop/tree/main/rbdev-gui) | Optional Windows GUI for IDF labs (not used here) |

Each lab folder also has its own **README.md** (goal, checklist, pitfalls).
Rebuild the ebook: `pwsh -File .\ebook\scripts\build.ps1`.

---

## Firmware co-development

This workshop teaches **browser APIs** and building the board link in the
page. It does **not** use the `robotos` host package (`@robotos/web`).

While labs are under development, [`firmware-esp32-s3-dev`](../firmware-esp32-s3-dev)
may be edited so the board side matches what you teach. Then rebuild,
refresh [`firmware-prebuilt/`](firmware-prebuilt/), and keep labs in sync.

---

## Naming

| Term | Meaning here |
|------|----------------|
| **Board** | ESP32-S3 SKU (`es3c28p` / `ws28p`) |
| **Track** | `web-app` (vanilla) or `demos` (React) |
| **Wire** | COBS-framed protobuf messages (`MSG_*`) |
| **`@sdk`** | Vanilla TypeScript library under `web-app/sdk/` |
| **`rb` / `rbdev`** | Flash CLI under `firmware-prebuilt/` (not ESP-IDF build) |

---

<div align="center">

**Clone → flash-bin → `vp dev` → open a lab**

[Open on GitHub](https://github.com/drsanti/hardware-interface-workshop) ·
[Issues](https://github.com/drsanti/hardware-interface-workshop/issues)

</div>
