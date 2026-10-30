# rbdev — flash CLI (this workshop)

In-repo host CLI to **flash prebuilt board images**. Students do **not**
build firmware here. Prefer the wrappers in the parent folder
(`../rb`, `../rb.cmd`) so the OS binary is selected for you.
On Windows PowerShell use `.\rb` (resolves to `rb.cmd`). Start each window with:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

Full flash notes: [`../README.md`](../README.md) · workshop root:
[`../../README.md`](../../README.md).

Binaries ship under `windows|mac|linux/` in **this folder** (all three OS
are in the git clone):

| Your OS | Binary |
|---------|--------|
| Windows x64 | `firmware-prebuilt/rbdev/windows/rbdev.exe` |
| macOS arm64 | `firmware-prebuilt/rbdev/mac/rbdev` |
| Linux x64 | `firmware-prebuilt/rbdev/linux/rbdev` |

Do **not** permanently add this folder to `PATH`. On macOS, first launch
may need **right-click → Open** (Gatekeeper) until notarization.

---

## Flash prebuilt firmware

```powershell
# Once per PowerShell window (avoids "not digitally signed"):
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

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
./scripts/install-to-workshops.sh   # host OS only; Linux from Mac → cross
```

Do not update only one workshop. Checklist:
[`docs/ship-binaries.md`](https://github.com/drsanti/rbdev/blob/main/docs/ship-binaries.md) ·
[`AGENTS.md`](https://github.com/drsanti/rbdev/blob/main/AGENTS.md).
