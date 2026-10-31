# Labs Ebook

This site is the **reading and planning** companion for the Hardware Interface
workshop. Lab Markdown under `web-app/` and `demos/` remains the source of
truth; this HTML is **generated** from those READMEs so the curriculum cannot
silently drift into a second copy.

## How to use it

| Mode | What to open |
|------|----------------|
| **Bench (code / flash / browser APIs)** | Cursor + lab folder README next to the code |
| **Read / plan / review** | This ebook (`book/index.html`) |
| **Flash the board** | [Flash firmware](flash-firmware.md) then `firmware-prebuilt/` CLI |
| **Wire / session API** | [`@sdk` reference](sdk/index.md) |

## Two tracks

| Track | Folder | Port | Role |
|-------|--------|------|------|
| **Vanilla** | `web-app/` | **5174** | HTML / CSS / TypeScript MPA + `@sdk` |
| **React** | `demos/` | **5173** | React catalog (Serial/BLE → LED, SFX, mic, IMU, …) |

Flash **once** from [`firmware-prebuilt/`](../../firmware-prebuilt/), then pick a
track. Exercise numbers collide across tracks (both have an `ex10`) — this ebook
namespaces them as **Vanilla** vs **React**.

## Prerequisites

- **Node 20+** and the workshop Vite+ CLI (`vp`)
- **Chrome or Edge** (Web Serial / Web Bluetooth)
- Secure context: `http://localhost:…` or HTTPS
- Python + `esptool` for flash only (no ESP-IDF for students)
- Board: **es3c28p** (LED + mic) or **ws28p** (IMU + RTC)

See [Boards and capabilities](boards-and-caps.md) and [Reading order](reading-order.md).

## Rebuild this ebook

From the workshop root (requires `mdbook` on PATH):

```powershell
pwsh -File .\ebook\scripts\build.ps1
```

Do **not** edit files under `src/generated/` by hand — re-run the build after
changing a labsheet README.
