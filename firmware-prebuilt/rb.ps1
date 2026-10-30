# Wrapper → firmware-prebuilt/rbdev/<os>/rbdev
$ErrorActionPreference = "Stop"
$here = $PSScriptRoot
$exe = Join-Path $here "rbdev\windows\rbdev.exe"
if (-not (Test-Path -LiteralPath $exe)) {
    throw "missing $exe — ask instructor or rebuild rbdev"
}
& $exe @args
exit $LASTEXITCODE
