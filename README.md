# Hardware Interface Workshop

Browser workshops for talking to Cronos boards over **Web Serial** /
**Web Bluetooth**. Two Vite+ projects share [`firmware-prebuilt/`](firmware-prebuilt/).

| Project | Role | Port |
| ------- | ---- | ---- |
| [`web-app/`](web-app/) | Beginner HTML / CSS / TypeScript + [`sdk/`](web-app/sdk/) | **5174** |
| [`demos/`](demos/) | React labs: Serial/BLE → LED, SFX, mic, IMU, … | **5173** |
| [`firmware-prebuilt/`](firmware-prebuilt/) | Flashable board images (`es3c28p`, `ws28p`) | — |

## Quick start

**Beginner track**

```bash
cd hardware-interface-workshop/web-app
vp install
vp dev          # http://localhost:5174/
```

**Board demos (React)**

```bash
cd hardware-interface-workshop/demos
vp install
vp dev          # http://localhost:5173/
```

Flash a board first — see [`firmware-prebuilt/README.md`](firmware-prebuilt/README.md).
Firmware source: [`../firmware-esp32-s3-dev`](../firmware-esp32-s3-dev).
