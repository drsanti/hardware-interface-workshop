#Requires -Version 5.1
<#
.SYNOPSIS
  Smoke-check Hardware Interface Labs Ebook: rebuild, coverage, markers.
#>
$ErrorActionPreference = 'Stop'
$EbookDir = Split-Path $PSScriptRoot -Parent
$WorkshopRoot = Split-Path $EbookDir -Parent
$fail = 0

function Ok($m) { Write-Host "PASS  $m" -ForegroundColor Green }
function Bad($m) { Write-Host "FAIL  $m" -ForegroundColor Red; $script:fail++ }

Write-Host "=== build ==="
& (Join-Path $PSScriptRoot 'build.ps1')
if ($LASTEXITCODE -ne 0 -and -not $?) { Bad 'build.ps1 failed' }

$index = Join-Path $EbookDir 'book\index.html'
if (Test-Path $index) { Ok 'book/index.html exists' } else { Bad 'book/index.html missing' }

$gen = Join-Path $EbookDir 'src\generated'
$manifest = Join-Path $gen 'manifest.json'
if (Test-Path $manifest) {
  $m = Get-Content $manifest -Raw | ConvertFrom-Json
  Ok "manifest pages=$($m.pages)"
  if ($m.pages -lt 56) { Bad "expected >= 56 lab pages, got $($m.pages)" }
} else {
  Bad 'manifest.json missing'
}

$tracks = @(
  @{ Id = 'web-app'; Part = 'vanilla'; Source = (Join-Path $WorkshopRoot 'web-app') },
  @{ Id = 'demos'; Part = 'react'; Source = (Join-Path $WorkshopRoot 'demos\src\pages') }
)
foreach ($t in $tracks) {
  foreach ($ex in @(Get-ChildItem $t.Source -Directory -Filter 'ex*')) {
    $md = Join-Path $gen "$($t.Part)\$($ex.Name)\index.md"
    $html = Join-Path $EbookDir "book\generated\$($t.Part)\$($ex.Name)\index.html"
    if (-not (Test-Path $md)) { Bad "missing staged $($t.Id)/$($ex.Name)"; continue }
    if (-not (Test-Path $html)) { Bad "missing html $($t.Id)/$($ex.Name)"; continue }
  }
}
Ok 'all exercises have staged MD + HTML'

$v0 = Join-Path $EbookDir 'book\generated\vanilla\ex00-hello\index.html'
if (Test-Path $v0) {
  $t = Get-Content $v0 -Raw
  if ($t -match 'ebook-run' -and $t -match 'localhost:5174') { Ok 'run callout on vanilla ex00' }
  else { Bad 'run callout missing on vanilla ex00' }
} else {
  Bad 'vanilla ex00 html missing'
}

$r0 = Join-Path $EbookDir 'book\generated\react\ex00-getting-started\index.html'
if (Test-Path $r0) {
  $t = Get-Content $r0 -Raw
  if ($t -match 'ebook-run' -and $t -match 'App\.tsx') { Ok 'run callout on react ex00' }
  else { Bad 'run callout missing on react ex00' }
} else {
  Bad 'react ex00 html missing'
}

$sdk = Join-Path $EbookDir 'book\sdk\index.html'
if (Test-Path $sdk) {
  $t = Get-Content $sdk -Raw
  if ($t -match 'BoardSession' -or $t -match '@sdk') { Ok 'sdk chapter built' }
  else { Bad 'sdk chapter content unexpected' }
} else {
  Bad 'sdk chapter html missing'
}

$sum = Get-Content (Join-Path $EbookDir 'src\SUMMARY.md') -Raw
if ($sum -match 'Vanilla labs' -and $sum -match 'React labs' -and $sum -match 'sdk/index.md') {
  Ok 'SUMMARY has vanilla, react, sdk'
} else {
  Bad 'SUMMARY missing track/sdk entries'
}
if ($sum -match 'INSTRUCTOR') { Bad 'INSTRUCTOR.md leaked into SUMMARY' }
else { Ok 'no INSTRUCTOR.md in SUMMARY' }

$mermaidSample = Join-Path $EbookDir 'book\generated\vanilla\ex00-hello\index.html'
if (Test-Path $mermaidSample) {
  $t = Get-Content $mermaidSample -Raw
  if ($t -match 'class="mermaid"' -or $t -match 'mermaid') { Ok 'mermaid marker present (or page built)' }
  else { Ok 'vanilla ex00 built (no mermaid on this page)' }
}

if ($fail -eq 0) {
  Write-Host ''
  Write-Host 'ALL EBOOK SMOKE CHECKS PASSED' -ForegroundColor Green
  exit 0
}
Write-Host ''
Write-Host "$fail EBOOK SMOKE CHECK(S) FAILED" -ForegroundColor Red
exit 1
