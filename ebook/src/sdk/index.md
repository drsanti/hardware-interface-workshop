# `@sdk` — board link library

<div class="ebook-run">

**Reference:** `@sdk` · **Project:** `web-app/sdk`

```text
cd web-app
vp install
# import from "@sdk" in lab TypeScript
```

<p class="ebook-source"><strong>Source:</strong> <code>web-app/sdk/README.md</code></p>

</div>


Talk to Cronos boards from the browser over **Web Serial** (USB) or
**Web Bluetooth**. Same COBS frames + protobuf payloads as the React
[`demos/`](../tracks/react.md) labs and [`firmware-esp32-s3-dev`](https://github.com/drsanti/firmware-esp32-s3-dev).

Import path: `@sdk` (Vite alias → this folder). Entry: [`index.ts`](index.ts).

---

## Install

```bash
cd hardware-interface-workshop/web-app
vp install   # pulls protobufjs
```

```ts
import { BoardSession, MSG_BOARD_INFO, MSG_LED_FX, decodeBoardInfo, encodeLedSolid } from "@sdk";
```

**Requirements:** Chrome or Edge · `localhost` or HTTPS · flashed
[`firmware-prebuilt/`](../flash-firmware.md) image.

---

## Quick start

```ts
const board = new BoardSession();

board.onChange(() => {
  console.log(board.status, board.ready, board.message);
});

board.subscribe((frame) => {
  if (frame.msgType === MSG_BOARD_INFO) {
    console.log(decodeBoardInfo(frame.payload));
  }
});

// Must run from a click handler (user gesture).
await board.connectSerial(); // or: board.connectBle()

await board.writeAcked(MSG_LED_FX, encodeLedSolid({ r: 40, g: 180, b: 60 }));
```

---

## Architecture

```
┌──────────────┐     USB / BLE bytes     ┌──────────────┐
│ BoardSession │ <---------------------> │    Board     │
│  (browser)   │                         │  (firmware)  │
└──────────────┘                         └──────────────┘
```

Under the session: `FrameDecoder` / `frameEncode` (COBS + CRC16),
`wire/*` protobuf codecs, and `browser` / `ble` helpers.

| Path                       | Role                                                       |
| -------------------------- | ---------------------------------------------------------- |
| [`session.ts`](session.ts) | `BoardSession` — connect, disconnect, frames, acked writes |
| [`browser.ts`](browser.ts) | Secure context + Serial / Bluetooth capability checks      |
| [`ble.ts`](ble.ts)         | GATT open / chunked writes                                 |
| [`caps.ts`](caps.ts)       | `CAP.*` feature bits from BoardInfo                        |
| [`wire/`](wire/)           | COBS, CRC, frame codec, BoardInfo / LedFx / SfxCmd         |

| Pipe | API           | Notes                                              |
| ---- | ------------- | -------------------------------------------------- |
| USB  | Web Serial    | Baud `921600`; settle `SERIAL_SETTLE_MS` (2500)    |
| BLE  | Web Bluetooth | Service `726f626f-…0001`; write chunks of 20 bytes |

---

## API reference

### Browser capability — `browser.ts`

| Export                    | Signature              | Description                                 |
| ------------------------- | ---------------------- | ------------------------------------------- |
| `isSecureContext`         | `() => boolean`        | `window.isSecureContext`                    |
| `hasWebSerial`            | `() => boolean`        | `"serial" in navigator`                     |
| `hasWebBluetooth`         | `() => boolean`        | `"bluetooth" in navigator`                  |
| `serialUnsupportedReason` | `() => string \| null` | Human reason, or `null` if Serial is usable |
| `bleUnsupportedReason`    | `() => string \| null` | Human reason, or `null` if BLE is usable    |

Use these before enabling Connect buttons (see [ex10](../ex10-web-serial/)).

---

### Session — `BoardSession` (`session.ts`)

Framework-agnostic link. One instance per page is typical.

#### Constants

| Name               | Value     | Meaning                                                |
| ------------------ | --------- | ------------------------------------------------------ |
| `SERIAL_BAUD`      | `921_600` | Baud passed to `port.open` (USB-JTAG often ignores it) |
| `SERIAL_SETTLE_MS` | `2500`    | Wait after USB open before `ready = true`              |
| `BLE_SETTLE_MS`    | `400`     | Short pause after GATT notify setup                    |

#### Types

```ts
type LinkStatus = "idle" | "picking" | "open" | "error";
type LinkTransport = "serial" | "ble";
type FrameHandler = (frame: DecodedFrame) => void;
type SessionChangeHandler = () => void;
```

#### Fields (read after `onChange`)

| Field       | Type                    | Meaning                                              |
| ----------- | ----------------------- | ---------------------------------------------------- |
| `status`    | `LinkStatus`            | Connection state machine                             |
| `message`   | `string \| null`        | Human-readable status line                           |
| `transport` | `LinkTransport \| null` | `"serial"` or `"ble"` when open                      |
| `ready`     | `boolean`               | `true` after settle — prefer waiting before commands |

#### Getters

| Getter            | Type      | Meaning                               |
| ----------------- | --------- | ------------------------------------- |
| `serialSupported` | `boolean` | Serial usable in this browser/context |
| `bleSupported`    | `boolean` | BLE usable                            |
| `supported`       | `boolean` | Either transport usable               |

#### Methods

| Method          | Signature                                           | Notes                                                          |
| --------------- | --------------------------------------------------- | -------------------------------------------------------------- |
| `subscribe`     | `(handler: FrameHandler) => () => void`             | Every decoded frame; returns unsubscribe                       |
| `onChange`      | `(handler: SessionChangeHandler) => () => void`     | Status / ready / message; returns unsubscribe                  |
| `connect`       | `() => Promise<void>`                               | Alias of `connectSerial`                                       |
| `connectSerial` | `() => Promise<void>`                               | Port picker + open; **needs user gesture**                     |
| `connectBle`    | `() => Promise<void>`                               | Device picker + GATT; **needs user gesture**                   |
| `disconnect`    | `() => Promise<void>`                               | Close port/GATT; `status → idle`, `ready → false`              |
| `writeFrame`    | `(msgType, payload) => Promise<number>`             | Send one framed command; returns outbound `seq`                |
| `writeAcked`    | `(msgType, payload, timeoutMs?) => Promise<number>` | `writeFrame` then wait for matching `CmdAck`; resolves to `rc` |

**`writeAcked` details**

- Default timeout: `2500` ms.
- Matches inbound `MSG_CMD_ACK` (`0x27`) on `msgType` + `seq`.
- A newer `writeAcked` rejects any previous pending wait (`"Replaced by a newer command."`).
- Timeout rejects with a hint about serial-bridge firmware.

**State sketch:** `idle` → `picking` → `open` (then `ready=true` after settle);
picker cancel returns to `idle`; `disconnect()` always returns to `idle`.

---

### Capabilities — `caps.ts`

Bit flags from `BoardInfo.caps` / firmware `bsp_caps()`.

| Export          | Value / signature        | Description               |
| --------------- | ------------------------ | ------------------------- |
| `CAP.LED`       | `0x01`                   | RGB LED                   |
| `CAP.MIC`       | `0x02`                   | Microphone                |
| `CAP.IMU`       | `0x04`                   | Motion sensor             |
| `CAP.RTC`       | `0x08`                   | Clock                     |
| `CAP.BATT`      | `0x10`                   | Battery                   |
| `CAP.BTN`       | `0x20`                   | Buttons                   |
| `CapId`         | type                     | Union of `CAP` values     |
| `boardHas`      | `(cap, caps) => boolean` | `(caps & cap) !== 0`      |
| `featureLabels` | `(caps) => string[]`     | Human labels for set bits |

```ts
const info = decodeBoardInfo(frame.payload);
if (boardHas(CAP.LED, info.caps)) {
  await board.writeAcked(MSG_LED_FX, encodeLedSolid({ r: 0, g: 80, b: 0 }));
}
```

---

### BLE helpers — `ble.ts`

Prefer `BoardSession.connectBle()` in apps. These are lower-level exports.

| Export            | Description                                              |
| ----------------- | -------------------------------------------------------- |
| `BLE_SVC`         | GATT service UUID `726f626f-746f-5300-8000-000000000001` |
| `BLE_RX`          | Host → board write characteristic (`…0002`)              |
| `BLE_TX`          | Board → host notify characteristic (`…0003`)             |
| `BLE_WRITE_CHUNK` | `20` — max payload per `writeValueWithResponse`          |
| `BleLink`         | `{ device, rx, tx, name }`                               |
| `openBleLink`     | Picker + discover + start notifications                  |
| `bleWrite`        | Chunked write of a full COBS frame onto `rx`             |
| `closeBleLink`    | Stop notifications + disconnect                          |

Device filters: service UUID, name prefix `rb-`, or `robotos`.

---

### Wire — frames (`wire/frame.ts`)

| Export           | Description                                                  |
| ---------------- | ------------------------------------------------------------ |
| `MSG_BOARD_INFO` | `0x28` — board identity (MCU → host)                         |
| `DecodedFrame`   | `{ msgType: number; seq: number; payload: Uint8Array }`      |
| `frameEncode`    | `(msgType, seq, payload) => Uint8Array` — full on-wire bytes |
| `FrameDecoder`   | Streaming splitter; `feed(chunk) => DecodedFrame[]`          |

On-wire layout (conceptual):

```
0x00 | COBS( msgType | seq_le16 | len_le16 | payload | crc16_le ) | 0x00
```

CRC: **CRC-16/XMODEM** (`poly 0x1021`, init `0`) — see `wire/crc16.ts`.
COBS: `cobsEncode` / `cobsDecode` in `wire/cobs.ts` (delimiter is `0x00`).

---

### Wire — BoardInfo (`wire/boardInfo.ts`)

| Export            | Description                              |
| ----------------- | ---------------------------------------- |
| `BoardInfoView`   | Decoded identity fields (below)          |
| `decodeBoardInfo` | `(payload: Uint8Array) => BoardInfoView` |

```ts
type BoardInfoView = {
  uuid: string;
  mac: string;
  hwModel: string;
  fwVersion: string;
  caps: number; // bitfield — use CAP / boardHas / featureLabels
  synced: boolean;
  unixNs: number;
  features: string[]; // from featureLabels(caps)
};
```

---

### Wire — LED (`wire/led.ts`)

| Constant        | Value  | Direction                     |
| --------------- | ------ | ----------------------------- |
| `MSG_LED_FX`    | `0x8e` | Host → board (effect command) |
| `MSG_LED_STATE` | `0x21` | Board → host (last color)     |
| `MSG_CMD_ACK`   | `0x27` | Board → host (command result) |

#### Effect codes — `LED_FX`

| Name      | Value |
| --------- | ----- |
| `OFF`     | `0`   |
| `SOLID`   | `1`   |
| `BLINK`   | `2`   |
| `FADE`    | `3`   |
| `RAINBOW` | `4`   |

#### Types

```ts
type Rgb = { r: number; g: number; b: number }; // 0..255 (clamped)

type LedFxParams = {
  effect: LedFxEffect;
  rgb?: Rgb;
  n?: number;
  delayMs?: number;
  onMs?: number;
  offMs?: number;
  endMs?: number;
  intensity?: number; // default 255
};

type CmdAckView = { msgType: number; reqSeq: number; rc: number };
```

#### Encoders / decoders

| Function                             | Description                                    |
| ------------------------------------ | ---------------------------------------------- |
| `encodeLedFx(params)`                | Full `LedFx` protobuf                          |
| `encodeLedSolid(rgb)`                | Solid color                                    |
| `encodeLedOff()`                     | Lights off                                     |
| `encodeLedBlink(rgb, onMs?, offMs?)` | Defaults 200 / 200                             |
| `encodeLedFade(rgb, onMs?, offMs?)`  | Defaults 500 / 500                             |
| `encodeLedRainbow(periodMs?)`        | Default period 1200 ms                         |
| `decodeLedState(payload)`            | → `Rgb`                                        |
| `decodeCmdAck(payload)`              | → `CmdAckView`                                 |
| `LED_PRESETS`                        | `[{ id, label, rgb }, …]` red/green/blue/white |

```ts
await board.writeAcked(MSG_LED_FX, encodeLedSolid({ r: 255, g: 0, b: 0 }));
await board.writeAcked(MSG_LED_FX, encodeLedBlink({ r: 0, g: 0, b: 255 }, 150, 150));
await board.writeAcked(MSG_LED_FX, encodeLedOff());
```

---

### Wire — Wave (`wire/wave.ts`)

| Constant       | Value  | Direction                          |
| -------------- | ------ | ---------------------------------- |
| `MSG_CMD_WAVE` | `0x83` | Host → board (R/G/B wave modules)  |

#### Shapes — `WAVE_SHAPE`

| Name       | Value |
| ---------- | ----- |
| `SIN`      | `0`   |
| `SQUARE`   | `1`   |
| `TRIANGLE` | `2`   |
| `SAWTOOTH` | `3`   |

| Function                    | Description                                      |
| --------------------------- | ------------------------------------------------ |
| `encodeWaveCmd(params)`     | Full `WaveCmd` protobuf                          |
| `encodeWaveStop(channel?)`  | Disable channel (`255` = all)                    |
| `encodeWaveColorWheel()`    | Three sine frames (boot-style RGB wheel)         |
| `encodeWaveAll(shape, hz?)` | Same shape on channels `255`                     |

```ts
await board.writeAcked(MSG_CMD_WAVE, encodeWaveAll(WAVE_SHAPE.SQUARE, 0.6));
for (const p of encodeWaveColorWheel()) {
  await board.writeAcked(MSG_CMD_WAVE, p);
}
```

---

### Wire — SFX (`wire/sfx.ts`)

| Constant        | Value  | Direction                  |
| --------------- | ------ | -------------------------- |
| `MSG_SFX_CMD`   | `0x84` | Host → board play / stop   |
| `MSG_SFX_PARAM` | `0x85` | Host → board live DSP knob |

#### Presets — `SFX_PRESET`

| Name        | Value |
| ----------- | ----- |
| `CHIME`     | `0`   |
| `ALARM`     | `1`   |
| `BEEP`      | `2`   |
| `USER`      | `3`   |
| `BIRD`      | `4`   |
| `BIRD_REV`  | `5`   |
| `AMBULANCE` | `6`   |
| `FIRE`      | `7`   |
| `POLICE`    | `8`   |
| `ENGINE`    | `9`   |
| `MOTOR`     | `10`  |
| `STOP`      | `255` |

```ts
type SfxPlayOpts = {
  volume?: number; // 0 = leave board volume unchanged
  loops?: number;
  durS?: number;
};
```

| Function                              | Description                            |
| ------------------------------------- | -------------------------------------- |
| `encodeSfxPlay(preset, opts?)`        | Play preset                            |
| `encodeSfxStop()`                     | Stop (`preset = STOP`)                 |
| `encodeSfxParam(stage, field, value)` | DSP knob; stage `0xFF` = master volume |

```ts
await board.writeAcked(MSG_SFX_CMD, encodeSfxPlay(SFX_PRESET.CHIME, { volume: 40 }));
await board.writeAcked(MSG_SFX_CMD, encodeSfxStop());
await board.writeAcked(MSG_SFX_PARAM, encodeSfxParam(0xff, 0, 40)); // master %
```

---

### Wire — Mic (`wire/mic.ts`)

Needs `CAP.MIC` (**es3c28p**). Levels work on USB or BLE; **PCM is USB-only**.

| Constant          | Value  | Direction                              |
| ----------------- | ------ | -------------------------------------- |
| `MSG_MIC_CMD`     | `0x86` | Host → board enable / gain / mute / stream |
| `MSG_AUDIO_LEVEL` | `0x23` | Board → host ~10 Hz while mic on       |
| `MSG_MIC_PCM`     | `0x24` | Board → host PCM chunks (`stream` on)  |

| Function                         | Description                                      |
| -------------------------------- | ------------------------------------------------ |
| `encodeMicCmd(params)`           | Omit fields you do not want to change            |
| `decodeAudioLevel(payload)`      | `{ rms, peak, frames, clipped }`                 |
| `decodeMicPcm(payload)`          | `{ seq, samples: Int16Array }`                   |
| `levelToPercent(amp, floorDb?)`  | Int16 amp → VU % (default floor −48 dBFS)        |

```ts
await board.writeAcked(MSG_MIC_CMD, encodeMicCmd({ enable: true, gainPct: 70 }));
await board.writeAcked(MSG_MIC_CMD, encodeMicCmd({ stream: true, enable: true })); // USB
const pct = levelToPercent(level.rms);
```

---

### Message ID cheat sheet

| ID     | Name             | Direction    | Codec                                      |
| ------ | ---------------- | ------------ | ------------------------------------------ |
| `0x21` | `MSG_LED_STATE`  | board → host | `decodeLedState`                           |
| `0x23` | `MSG_AUDIO_LEVEL`| board → host | `decodeAudioLevel`                         |
| `0x24` | `MSG_MIC_PCM`    | board → host | `decodeMicPcm` (USB)                       |
| `0x27` | `MSG_CMD_ACK`    | board → host | `decodeCmdAck` (also used by `writeAcked`) |
| `0x28` | `MSG_BOARD_INFO` | board → host | `decodeBoardInfo`                          |
| `0x84` | `MSG_SFX_CMD`    | host → board | `encodeSfxPlay` / `encodeSfxStop`          |
| `0x85` | `MSG_SFX_PARAM`  | host → board | `encodeSfxParam`                           |
| `0x86` | `MSG_MIC_CMD`    | host → board | `encodeMicCmd`                             |
| `0x8e` | `MSG_LED_FX`     | host → board | `encodeLed*`                               |

---

## Patterns

### Paint UI from session state

```ts
const unsub = board.onChange(() => {
  statusEl.textContent = `${board.status} ready=${board.ready}`;
});
// later: unsub();
```

### Filter inbound frames

```ts
board.subscribe((frame) => {
  switch (frame.msgType) {
    case MSG_BOARD_INFO:
      setInfo(decodeBoardInfo(frame.payload));
      break;
    case MSG_LED_STATE:
      setRgb(decodeLedState(frame.payload));
      break;
    default:
      break;
  }
});
```

### Wait for ready before commands

```ts
await board.connectSerial();
await new Promise<void>((resolve) => {
  if (board.ready) {
    resolve();
    return;
  }
  const off = board.onChange(() => {
    if (board.ready) {
      off();
      resolve();
    }
  });
});
await board.writeAcked(MSG_LED_FX, encodeLedSolid({ r: 0, g: 120, b: 40 }));
```

---

## Errors and pitfalls

| Situation                    | What happens                                                               |
| ---------------------------- | -------------------------------------------------------------------------- |
| Insecure origin / no Serial  | `serialUnsupportedReason()` string; `connectSerial` sets `status: "error"` |
| Picker cancelled             | `NotFoundError` → `status: "idle"`, calm message                           |
| `writeFrame` with no link    | Throws `"No link open."`                                                   |
| Ack timeout                  | `writeAcked` rejects after `timeoutMs`                                     |
| Overlapping `writeAcked`     | Previous promise rejects `"Replaced by a newer command."`                  |
| Call connect outside a click | Browser may block `requestPort` / `requestDevice`                          |

---

## Extending codecs

Mic, key, battery, and IMU payloads can be added under `wire/` the same way as
[`led.ts`](wire/led.ts) / [`sfx.ts`](wire/sfx.ts). Mirror
[`demos/src/lib/wire/`](../../demos/src/lib/wire/), export from
[`wire/index.ts`](wire/index.ts), and they re-export via `@sdk`.

---

## See also

- Lab: [ex10 — Web Serial](../ex10-web-serial/)
- Flash images: [`firmware-prebuilt/`](../flash-firmware.md)
- React demos (same wire): [`demos/`](../tracks/react.md)
- Firmware source: [`firmware-esp32-s3-dev`](https://github.com/drsanti/firmware-esp32-s3-dev)
