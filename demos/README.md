# demos — Hardware Interface (React)

Browser labs for **Web Serial** and **Web Bluetooth** against
[`firmware-esp32-s3-dev`](../../firmware-esp32-s3-dev).

Sibling projects: [`../web-app/`](../web-app/) (vanilla HTML/CSS/TS) ·
[`../firmware-prebuilt/`](../firmware-prebuilt/) (flash images).

## Target boards

Both SKUs speak the same board message format over USB and Bluetooth.
Switch the active target in [`src/lib/workshop.ts`](src/lib/workshop.ts)
(`WORKSHOP_BOARD_ID`) — comment / uncomment like the example switch in
`App.tsx`. Gate lab UI with `boardHas()`; never assume LED or mic.

| Feature      | `es3c28p` | `ws28p` | Notes                                     |
| ------------ | --------- | ------- | ----------------------------------------- |
| RGB LED      | yes       | no      | LED color labs need `es3c28p`             |
| Microphone   | yes       | no      | Audio over **Web Serial** only            |
| Motion (IMU) | no        | yes     | Motion labs need `ws28p`                  |
| Clock (RTC)  | no        | yes     | Keeps time on the board                   |
| Speaker      | yes       | yes     | Tones / sound effects                     |
| Touch / keys | yes       | yes     | Input labs                                |
| Battery      | yes       | yes     | Voltage reading                           |
| Caps mask    | `0x33`    | `0x3c`  | Used in code to enable the right features |

**Prebuilt images** (students can flash without ESP-IDF):

| Board                 | Folder                                                           | Notes                    |
| --------------------- | ---------------------------------------------------------------- | ------------------------ |
| **es3c28p** (default) | [`../firmware-prebuilt/es3c28p/`](../firmware-prebuilt/es3c28p/) | RGB LED + mic            |
| **ws28p**             | [`../firmware-prebuilt/ws28p/`](../firmware-prebuilt/ws28p/)     | IMU + RTC (no LED / mic) |

Preferred (`rbdev flash-bin` — Win/mac/Linux binaries in
[`../firmware-prebuilt/rbdev/`](../firmware-prebuilt/rbdev/)):

```bash
cd ../firmware-prebuilt
python3 -m pip install --user esptool
./rb config --port PORT --board es3c28p   # or ws28p
./rb flash-bin
```

Or manual esptool:

```bash
cd ../firmware-prebuilt/es3c28p   # or: ws28p
python3 -m pip install --user esptool
python3 -m esptool --chip esp32s3 -p PORT write-flash "@flash_args"
```

`PORT` = `COMx` (Windows), `/dev/cu.usbmodem*` (macOS), or
`/dev/ttyACM0` / `/dev/ttyUSB0` (Linux). Full platform notes:
[`../firmware-prebuilt/README.md`](../firmware-prebuilt/README.md).

Instructors rebuilding firmware: activate ESP-IDF via `$IDF_PATH/export.sh`
(Linux/macOS) or `$IDF_PATH\export.ps1` (Windows), then
`idf.py -DBOARD=es3c28p build` (or `ws28p`) and refresh the matching
prebuilt folder.

## Stack

| Tool                                 | Role                           |
| ------------------------------------ | ------------------------------ |
| [Vite+](https://viteplus.dev/) `1.4` | Unified toolchain (`vp`)       |
| React 19 + TypeScript 7              | UI                             |
| Tailwind CSS 4                       | Styling (`@tailwindcss/vite`)  |
| Lucide                               | Icons                          |
| Zustand                              | Client state                   |
| protobufjs                           | Encode / decode board messages |
| react-router                         | Lab navigation                 |

## Requirements

- Node.js 20+ (scaffold tested on Node 26)
- Chrome or Edge (Web Serial / Web Bluetooth)
- Secure context: `localhost` or HTTPS
- Board flashed from the matching `firmware-prebuilt/<board>/` folder
  (`es3c28p` or `ws28p`, matching `WORKSHOP_BOARD_ID`)

## Commands

```bash
cd hardware-interface-workshop/demos
vp install
vp dev             # http://localhost:5173/
vp check
vp build
```

Beginner track (no React): [`../web-app/`](../web-app/) → `vp dev` on port **5174**.

Package scripts:

```bash
npm run dev
npm run build
npm run preview
```

## Co-development (firmware)

This workshop teaches **browser APIs** (Web Serial / Web Bluetooth) and
building the board link yourself in the page. It does **not** use the
[`robotos`](../../robotos) host SDK (`@robotos/web`) — that belongs to a
different workshop track.

While labs are under development, [`firmware-esp32-s3-dev`](../../firmware-esp32-s3-dev)
may be edited so the board side matches what you teach (LED, mic,
BLE/serial, acks, caps, handlers, wire docs).

Workflow:

1. Change firmware (and/or workshop lab UI) for the lesson.
2. Activate ESP-IDF (`export.sh` / `export.ps1` / `export.bat`), then
   `idf.py -DBOARD=es3c28p build` (or `ws28p`) and flash.
3. Refresh [`../firmware-prebuilt/`](../firmware-prebuilt/) for the matching board
   so students stay on a matching image.
4. Update workshop labs / README if the wire contract or UX changed.

`firmware-prebuilt/` is a **snapshot**, not a frozen API. Keep bins and
labs in sync with the contract you are teaching.

## Examples (switch in `src/App.tsx`)

Each lab lives under `src/pages/exNN-…/`. Enable **one** at a time — comment
the active import + `<Route>` and uncomment the next (same pattern as
`firmware-esp32-s3-workshop` rtos-labs `main.c`).

**Student code stays thin:** each lab’s `index.tsx` should stay a short
composition. Long copy / chrome goes in sibling files in the same folder
(e.g. `Ex00Header.tsx`). Shared UI lives in `src/components/` (and
`src/components/lab/`); reusable logic in `src/hooks/`.

| Folder                                                        | Focus                               | Guide                                                |
| ------------------------------------------------------------- | ----------------------------------- | ---------------------------------------------------- |
| [`ex00-getting-started`](src/pages/ex00-getting-started/)     | Overview + browser Serial/BLE check | [README](src/pages/ex00-getting-started/README.md)   |
| [`ex01-react-component`](src/pages/ex01-react-component/)     | React props / state / hook warm-up  | [README](src/pages/ex01-react-component/README.md)   |
| [`ex02-web-serial-picker`](src/pages/ex02-web-serial-picker/) | USB / BLE connect / disconnect      | [README](src/pages/ex02-web-serial-picker/README.md) |
| [`ex03-board-hello`](src/pages/ex03-board-hello/)             | Listen for board identity message   | [README](src/pages/ex03-board-hello/README.md)       |
| [`ex04-rgb-led`](src/pages/ex04-rgb-led/)                     | Send RGB LED color over Web Serial  | [README](src/pages/ex04-rgb-led/README.md)           |
| [`ex05-led-studio`](src/pages/ex05-led-studio/)               | RGB sliders + LedFx motion presets  | [README](src/pages/ex05-led-studio/README.md)        |
| [`ex06-sfx-play`](src/pages/ex06-sfx-play/)                   | Play SFX presets + stop             | [README](src/pages/ex06-sfx-play/README.md)          |
| [`ex07-sfx-volume`](src/pages/ex07-sfx-volume/)               | SFX volume + loops                  | [README](src/pages/ex07-sfx-volume/README.md)        |
| [`ex08-sfx-params`](src/pages/ex08-sfx-params/)               | Live SfxParam knobs                 | [README](src/pages/ex08-sfx-params/README.md)        |
| [`ex09-sfx-melody`](src/pages/ex09-sfx-melody/)               | Upload SfxProg user melody          | [README](src/pages/ex09-sfx-melody/README.md)        |
| [`ex10-sfx-studio`](src/pages/ex10-sfx-studio/)               | Full speaker studio                 | [README](src/pages/ex10-sfx-studio/README.md)        |
| [`ex11-mic-hello`](src/pages/ex11-mic-hello/)                 | Enable mic + AudioLevel numbers     | [README](src/pages/ex11-mic-hello/README.md)         |
| [`ex12-mic-vu`](src/pages/ex12-mic-vu/)                       | Mic VU meter                        | [README](src/pages/ex12-mic-vu/README.md)            |
| [`ex13-mic-gain`](src/pages/ex13-mic-gain/)                   | Mic gain + mute                     | [README](src/pages/ex13-mic-gain/README.md)          |
| [`ex14-mic-wave`](src/pages/ex14-mic-wave/)                   | Mic PCM waveform                    | [README](src/pages/ex14-mic-wave/README.md)          |
| [`ex15-mic-studio`](src/pages/ex15-mic-studio/)               | Full mic studio                     | [README](src/pages/ex15-mic-studio/README.md)        |
| [`ex16-key-hello`](src/pages/ex16-key-hello/)                 | Listen for KeyEvent                 | [README](src/pages/ex16-key-hello/README.md)         |
| [`ex17-key-action`](src/pages/ex17-key-action/)               | SHORT → Beep (+ LED)                | [README](src/pages/ex17-key-action/README.md)        |
| [`ex18-batt-hello`](src/pages/ex18-batt-hello/)               | BatteryStatus mV / %                | [README](src/pages/ex18-batt-hello/README.md)        |
| [`ex19-batt-warn`](src/pages/ex19-batt-warn/)                 | Low-battery warn UI                 | [README](src/pages/ex19-batt-warn/README.md)         |
| [`ex20-imu-hello`](src/pages/ex20-imu-hello/)                 | IMU accel bars (ws28p)              | [README](src/pages/ex20-imu-hello/README.md)         |
| [`ex21-imu-shake`](src/pages/ex21-imu-shake/)                 | Shake → Beep (ws28p)                | [README](src/pages/ex21-imu-shake/README.md)         |
| [`ex22-rtc-sync`](src/pages/ex22-rtc-sync/)                   | TimeSync + board clock              | [README](src/pages/ex22-rtc-sync/README.md)          |
| [`ex23-sound-led`](src/pages/ex23-sound-led/)                 | Sound-reactive LED                  | [README](src/pages/ex23-sound-led/README.md)         |
| [`ex24-button-appliance`](src/pages/ex24-button-appliance/)   | Key + LED + SFX appliance           | [README](src/pages/ex24-button-appliance/README.md)  |
| [`ex25-caps-gate`](src/pages/ex25-caps-gate/)                 | CAP matrix / board switch           | [README](src/pages/ex25-caps-gate/README.md)         |
| [`ex26-mic-fft`](src/pages/ex26-mic-fft/)                     | MicPcm → live FFT bars              | [README](src/pages/ex26-mic-fft/README.md)           |
| [`ex27-mic-spectrogram`](src/pages/ex27-mic-spectrogram/)     | MicPcm → scrolling spectrogram      | [README](src/pages/ex27-mic-spectrogram/README.md)   |
| [`ex28-mic-recorder`](src/pages/ex28-mic-recorder/)           | MicPcm → WAV record / play          | [README](src/pages/ex28-mic-recorder/README.md)      |
| [`ex29-mic-filter`](src/pages/ex29-mic-filter/)               | MicPcm → live biquad filter         | [README](src/pages/ex29-mic-filter/README.md)        |
| [`ex30-mic-features`](src/pages/ex30-mic-features/)           | MicPcm → MIR feature meters         | [README](src/pages/ex30-mic-features/README.md)      |
| [`ex31-mic-pitch`](src/pages/ex31-mic-pitch/)                 | MicPcm → YIN pitch / note           | [README](src/pages/ex31-mic-pitch/README.md)         |
| [`ex32-mic-classify`](src/pages/ex32-mic-classify/)             | MicPcm → sound class (k-NN)         | [README](src/pages/ex32-mic-classify/README.md)      |
| [`ex33-mic-react`](src/pages/ex33-mic-react/)                 | Classify → LED / SFX on board       | [README](src/pages/ex33-mic-react/README.md)        |
| [`ex34-sense-appliance`](src/pages/ex34-sense-appliance/)     | Classify + key + batt appliance     | [README](src/pages/ex34-sense-appliance/README.md)  |

Each example folder includes a **README.md** (goal, board notes, file map,
checklist).
