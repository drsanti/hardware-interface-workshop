# rbdev (this workshop)

Host CLI to **flash prebuilt board images** — students do **not** build
firmware here.

Binaries ship under `windows|mac|linux/` in **this folder**:

| Your OS | Binary |
|---------|--------|
| Windows x64 | `firmware-prebuilt/rbdev/windows/rbdev.exe` |
| macOS arm64 | `firmware-prebuilt/rbdev/mac/rbdev` |
| Linux x64 | `firmware-prebuilt/rbdev/linux/rbdev` |

Do **not** permanently add this folder to `PATH`.

---

## Flash prebuilt firmware

```powershell
# once per PC
python -m pip install --user esptool

cd hardware-interface-workshop   # workshop root (or any subfolder)

# Windows — use the in-repo binary:
.\firmware-prebuilt\rbdev\windows\rbdev.exe doctor
.\firmware-prebuilt\rbdev\windows\rbdev.exe config --port COMx --board es3c28p
# or: --board ws28p

.\firmware-prebuilt\rbdev\windows\rbdev.exe flash-bin
```

```bash
# macOS / Linux
chmod +x firmware-prebuilt/rbdev/mac/rbdev firmware-prebuilt/rbdev/linux/rbdev
./firmware-prebuilt/rbdev/mac/rbdev config --port /dev/cu.usbmodemXXXX --board es3c28p
./firmware-prebuilt/rbdev/mac/rbdev flash-bin
```

`flash-bin` finds `firmware-prebuilt/<board>/` (needs `flash_args` + bins).
No ESP-IDF project build.

Manual esptool: see [../README.md](../README.md).

---

## Maintainers / AI agents

**Required:** after any `rbdev` source change, install the new binary into
**this folder and** `firmware-esp32-s3-workshop/rbdev/<os>/` (same build).

From the `rbdev` tool repo (workshops as siblings):

```powershell
.\scripts\install-to-workshops.ps1
```

```bash
./scripts/install-to-workshops.sh
```

Do not update only one workshop. Checklist:
[`docs/ship-binaries.md`](https://github.com/drsanti/rbdev/blob/main/docs/ship-binaries.md) ·
[`AGENTS.md`](https://github.com/drsanti/rbdev/blob/main/AGENTS.md).
