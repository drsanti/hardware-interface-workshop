# Prebuilt firmware

Flashable board images for the
[hardware-interface-workshop](../README.md) — **no ESP-IDF required** for
students. Built from
[`firmware-esp32-s3-dev/esp32s3`](../../firmware-esp32-s3-dev/esp32s3)
(app target `robotos_serial_bridge` — binary name only; this workshop does
**not** use the `robotos` host SDK).

| Folder                 | `-DBOARD=` | Caps focus                                    |
| ---------------------- | ---------- | --------------------------------------------- |
| [`es3c28p/`](es3c28p/) | `es3c28p`  | RGB LED + mic (`caps=0x33`, default)          |
| [`ws28p/`](ws28p/)     | `ws28p`    | IMU + RTC (`caps=0x3c`; **no** RGB LED / mic) |

| Consumer | How to pick the board |
| -------- | --------------------- |
| React demos | `WORKSHOP_BOARD_ID` in [`../demos/src/lib/workshop.ts`](../demos/src/lib/workshop.ts) |
| Vanilla labs | Lab README / `CAP.*` gates (LED+mic → `es3c28p`) |
| Flash CLI | `.\rb config --board es3c28p` or `ws28p` |

**Co-development:** the firmware tree is fair game while the workshop is
built — improve handlers, BLE/serial paths, or docs so labs have what they
need, then rebuild and replace the bins here.

## Layout

```
firmware-prebuilt/
  README.md
  rb / rb.cmd              # wrappers → rbdev/<os>/ (Windows: rb.cmd)
  rbdev/
    windows/rbdev.exe
    mac/rbdev
    linux/rbdev
  es3c28p/
    bootloader.bin
    partition-table.bin
    robotos_serial_bridge.bin
    flash_args
    flasher_args.json
  ws28p/
    … (same filenames)
```

## Serial port names

Replace `PORT` below with your board’s USB-Serial/JTAG device:

| OS      | Typical device                                                              |
| ------- | --------------------------------------------------------------------------- |
| Windows | `COM3`, `COM17`, … (Device Manager → Ports)                                 |
| macOS   | `/dev/cu.usbmodem*` or `/dev/cu.usbserial*`                                 |
| Linux   | `/dev/ttyACM0` or `/dev/ttyUSB0` (add user to `dialout` / `uucp` if needed) |

Quit any serial monitor or IDE monitor before flashing or using Web
Serial.

## Flash (students — no ESP-IDF required)

### Preferred: `rbdev flash-bin`

The CLI ships in [`rbdev/`](rbdev/) for **Windows, macOS arm64, and Linux
x64** (see [rbdev/README.md](rbdev/README.md)). Needs Python + `esptool`
only — no ESP-IDF.

```powershell
# Once per PowerShell window (avoids "not digitally signed"):
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# once per PC
python -m pip install --user esptool

cd hardware-interface-workshop\firmware-prebuilt
.\rb config --port COMx --board es3c28p   # or ws28p — YOUR port
.\rb flash-bin

# or from workshop root:
.\firmware-prebuilt\rb.cmd flash-bin --board ws28p -p COMx
```

```bash
# macOS / Linux
python3 -m pip install --user esptool
cd hardware-interface-workshop/firmware-prebuilt
chmod +x rbdev/mac/rbdev rbdev/linux/rbdev rb 2>/dev/null || true
./rb config --port /dev/cu.usbmodemXXXX --board es3c28p
./rb flash-bin
```

`flash-bin` does **not** build firmware; it runs `esptool` against
`es3c28p/` or `ws28p/` `flash_args`.

### Manual: `esptool` only

Install [esptool](https://docs.espressif.com/projects/esptool/) once, then
flash from the board folder:

```bash
# Python 3.10+ recommended
python3 -m pip install --user esptool

cd firmware-prebuilt/es3c28p   # or: ws28p
python3 -m esptool --chip esp32s3 -p PORT write-flash "@flash_args"
```

On Windows PowerShell, `python` is often the launcher:

```powershell
cd firmware-prebuilt\es3c28p   # or: ws28p
python -m pip install --user esptool
python -m esptool --chip esp32s3 -p COM17 write-flash "@flash_args"
```

Explicit offsets (same layout in either folder):

```bash
python3 -m esptool --chip esp32s3 -p PORT -b 460800 \
  --before default-reset --after hard-reset \
  write-flash --flash-mode dio --flash-size 2MB --flash-freq 80m \
  0x0 bootloader.bin \
  0x8000 partition-table.bin \
  0x10000 robotos_serial_bridge.bin
```

## Flash / rebuild with ESP-IDF (instructors / contributors)

Activate ESP-IDF in **each new shell** first. Paths depend on where you
cloned IDF — set `IDF_PATH` to your install (examples only):

```bash
# Linux / macOS (bash/zsh)
. $HOME/esp/esp-idf/export.sh
# or: . $IDF_PATH/export.sh
```

```powershell
# Windows (PowerShell)
. $env:IDF_PATH\export.ps1
# if IDF_PATH is unset, point at your clone, e.g.:
#   . C:\Espressif\frameworks\esp-idf-v5.x\export.ps1
```

```cmd
:: Windows (cmd)
%IDF_PATH%\export.bat
```

That puts `idf.py` and IDF’s Python (with `esptool`) on `PATH`. System
Python alone often has **no** `esptool` until you `pip install` it.

Then flash a prebuilt folder:

```bash
cd hardware-interface-workshop/firmware-prebuilt/es3c28p  # or ws28p
python -m esptool --chip esp32s3 -p PORT write-flash "@flash_args"
```

Or flash/rebuild from the firmware project:

```bash
cd firmware-esp32-s3-dev/esp32s3
idf.py -DBOARD=es3c28p -p PORT flash   # or: -DBOARD=ws28p
idf.py -DBOARD=es3c28p build           # or: -DBOARD=ws28p
```

## Refresh prebuilt bins (maintainers / AI agents)

When **`firmware-esp32-s3-dev`** changes the serial-bridge app, rebuild
**both** boards and install here. Preferred (ESP-IDF shell):

```powershell
cd ..\firmware-esp32-s3-dev
.\scripts\install-prebuilt-to-hi-workshop.ps1
```

```bash
cd ../firmware-esp32-s3-dev
. "$IDF_PATH/export.sh"
./scripts/install-prebuilt-to-hi-workshop.sh
```

That updates `es3c28p/` **and** `ws28p/` (bins + flat `flash_args`).
See [`firmware-esp32-s3-dev/AGENTS.md`](../../firmware-esp32-s3-dev/AGENTS.md).

| Build output                          | → prebuilt folder           |
| ------------------------------------- | --------------------------- |
| `bootloader/bootloader.bin`           | `bootloader.bin`            |
| `partition_table/partition-table.bin` | `partition-table.bin`       |
| `robotos_serial_bridge.bin`           | `robotos_serial_bridge.bin` |

**Note:** one CMake `build/` tree holds only the last `-DBOARD=` image — the
script reconfigures + builds each SKU before copying.
