# Flash firmware

Students flash **prebuilt** images — **no ESP-IDF**. Images live under
`firmware-prebuilt/` (`es3c28p`, `ws28p`).

## Prerequisites

- Python 3.10+ and `esptool` (`python -m pip install --user esptool`)
- USB cable to the board
- Serial port name (Windows `COMx`, macOS `/dev/cu.usbmodem*`, Linux `/dev/ttyACM0`)
- Quit any serial monitor / IDE monitor before flashing

## Preferred: `rb` / `rbdev flash-bin`

```powershell
# Once per PowerShell window (avoids "not digitally signed"):
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

python -m pip install --user esptool

cd hardware-interface-workshop\firmware-prebuilt
.\rb config --port COMx --board es3c28p   # or ws28p — YOUR port
.\rb flash-bin
```

```bash
# macOS / Linux
python3 -m pip install --user esptool
cd hardware-interface-workshop/firmware-prebuilt
chmod +x rbdev/mac/rbdev rbdev/linux/rbdev rb 2>/dev/null || true
./rb config --port /dev/cu.usbmodemXXXX --board es3c28p
./rb flash-bin
```

`flash-bin` runs `esptool` against the board folder’s `flash_args` — it does
**not** build firmware.

## After flash

1. Unplug/replug if the port vanished
2. Start a track: `cd web-app` or `cd demos` → `vp install` → `vp dev`
3. Match React `WORKSHOP_BOARD_ID` to the board you flashed

More detail (manual esptool, instructor IDF rebuild): see
`firmware-prebuilt/README.md` and `firmware-prebuilt/rbdev/README.md` in the repo.
