# Boards and capabilities

Both SKUs speak the same COBS + protobuf wire over **USB Serial** and
**Web Bluetooth**. Feature sets differ — labs must gate on caps, not board name
alone.

## SKU matrix

| Feature | `es3c28p` | `ws28p` | Notes |
|---------|-----------|---------|--------|
| RGB LED | yes | no | LED color labs need `es3c28p` |
| Microphone | yes | no | Levels USB/BLE; **PCM is Web Serial only** |
| Motion (IMU) | no | yes | Motion labs need `ws28p` |
| Clock (RTC) | no | yes | Keeps time on the board |
| Speaker | yes | yes | Tones / SFX |
| Touch / keys | yes | yes | Input labs |
| Battery | yes | yes | Voltage reading |
| Typical caps mask | `0x33` | `0x3c` | Used in code to enable features |

## How students pick the board

| Consumer | Where |
|----------|--------|
| Flash CLI | `.\rb config --board es3c28p` or `ws28p` |
| React demos | `WORKSHOP_BOARD_ID` in `demos/src/lib/workshop.ts` |
| Vanilla labs | Lab README + `CAP.*` gates (LED/mic → flash `es3c28p`) |

Prebuilt folders: `firmware-prebuilt/es3c28p/` and `firmware-prebuilt/ws28p/`.

## Suggested forks

```text
es3c28p path:  flash → vanilla ex00–20 → react ex00–15, ex16–19, ex23–25, ex26–34
ws28p path:    flash → vanilla ex00–11, ex15–17 (SFX) → react ex00–03, ex06–10, ex16–22, ex24–25
```

Skip LED/mic chapters on `ws28p`; skip IMU/RTC chapters on `es3c28p`.
