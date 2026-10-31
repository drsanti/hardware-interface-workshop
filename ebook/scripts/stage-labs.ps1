#Requires -Version 5.1
<#
.SYNOPSIS
  Stage web-app + demos README labsheets into ebook/src/generated, stage @sdk,
  and write SUMMARY.md.
#>
$ErrorActionPreference = 'Stop'

# PSScriptRoot = workshop/ebook/scripts
$EbookDir = Split-Path $PSScriptRoot -Parent
$WorkshopRoot = Split-Path $EbookDir -Parent
$SrcDir = Join-Path $EbookDir 'src'
$GenDir = Join-Path $SrcDir 'generated'
$SdkSrc = Join-Path $WorkshopRoot 'web-app\sdk\README.md'
$SdkDest = Join-Path $SrcDir 'sdk\index.md'
$script:MermaidFence = [string]::new([char]96, 3) # three backticks

function Get-LabNumber([string]$ExName) {
  if ($ExName -match '^ex(\d+)') { return $Matches[1] }
  return '00'
}

function New-RunBlock {
  param(
    [string]$TrackId,
    [string]$Part,
    [string]$ExName,
    [string]$RelSource,
    [string]$Badge = $null
  )
  $lines = New-Object System.Collections.Generic.List[string]
  $lines.Add('')
  $lines.Add('<div class="ebook-run">')
  $lines.Add('')
  if ($TrackId -eq 'web-app') {
    $lines.Add("**Track:** ``vanilla`` · **Project:** ``web-app`` · **Port:** ``5174``")
  }
  else {
    $lines.Add("**Track:** ``react`` · **Project:** ``demos`` · **Port:** ``5173``")
  }
  if ($Badge) {
    $lines.Add('')
    $lines.Add($Badge)
  }
  $lines.Add('')
  $lines.Add('```text')
  if ($TrackId -eq 'web-app') {
    $lines.Add('cd web-app')
    $lines.Add('vp install   # first time')
    $lines.Add('vp dev')
    $lines.Add("# open http://localhost:5174/$ExName/")
  }
  else {
    $lines.Add('cd demos')
    $lines.Add('vp install   # first time')
    $lines.Add('vp dev')
    $lines.Add("# enable $ExName in demos/src/App.tsx (import + <Route>)")
    $lines.Add('# match WORKSHOP_BOARD_ID in demos/src/lib/workshop.ts')
  }
  $lines.Add('```')
  $lines.Add('')
  $lines.Add("<p class=`"ebook-source`"><strong>Source:</strong> <code>$RelSource</code></p>")
  $lines.Add('')
  $lines.Add('</div>')
  $lines.Add('')
  return ($lines -join "`n")
}

function Insert-AfterFirstHeading([string]$Body, [string]$Insert) {
  $m = [regex]::Match($Body, '(?m)^#\s+.+$')
  if (-not $m.Success) {
    return $Insert + $Body
  }
  $end = $m.Index + $m.Length
  return $Body.Substring(0, $end) + "`n" + $Insert + $Body.Substring($end)
}

function Repair-LabLinks {
  param(
    [string]$Body,
    [string]$Part
  )
  # Sibling labs: ../exNN-name/ or ../exNN-name/README.md → ebook path
  $body = [regex]::Replace(
    $Body,
    '\]\(\.\./(ex\d+-[a-z0-9-]+)(?:/README\.md)?/?\)',
    "](../../generated/$Part/`$1/index.md)"
  )
  # Same-folder README links rarely used; normalize ./ex style if any
  $body = [regex]::Replace(
    $body,
    '\]\(\./(ex\d+-[a-z0-9-]+)(?:/README\.md)?/?\)',
    "](../../generated/$Part/`$1/index.md)"
  )
  # React App.tsx relative links → repo path in prose-friendly link
  $body = $body -replace '\]\(\.\./\.\./App\.tsx\)', '](../../../../demos/src/App.tsx)'
  $body = $body -replace '\]\(\.\./\.\./lib/workshop\.ts\)', '](../../../../demos/src/lib/workshop.ts)'
  # Vanilla sdk pointers from web-app/ex*
  $body = $body -replace '\]\(\.\./sdk(?:/README\.md)?/?\)', '](../../../sdk/index.md)'
  $body = $body -replace '\]\(\.\./\.\./sdk(?:/README\.md)?/?\)', '](../../../sdk/index.md)'
  return $body
}

function Repair-MermaidDiagram([string]$Diagram) {
  # Mermaid treats '#' as a line comment — CSS/DOM ids like span#count break parsers.
  $d = [regex]::Replace($Diagram, '(?<=\w)#(?=[A-Za-z_])', ' id=')
  $d = [regex]::Replace($d, '(?<=[\s\[\(\/])#(?=[A-Za-z_])', 'id=')
  return $d
}

function Write-StagedMarkdown {
  param(
    [string]$DestPath,
    [string]$RunBlock,
    [string]$Body,
    [string]$Part
  )
  $dir = Split-Path $DestPath -Parent
  if (-not (Test-Path $dir)) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
  }
  $body = $Body -replace "`r`n", "`n" -replace "`r", "`n"
  $body = Repair-LabLinks -Body $body -Part $Part
  # Keep ```mermaid fences (do NOT wrap in <div class="mermaid">).
  # Raw HTML divs are still markdown-parsed by mdBook, which turns -->> into
  # an en-dash and breaks sequenceDiagram. ebook.js upgrades code.language-mermaid.
  $body = [regex]::Replace(
    $body,
    ($script:MermaidFence + 'mermaid\s*\n([\s\S]*?)' + $script:MermaidFence),
    {
      param($m)
      $diagram = Repair-MermaidDiagram ($m.Groups[1].Value.Trim())
      return ($script:MermaidFence + 'mermaid' + "`n" + $diagram + "`n" + $script:MermaidFence)
    },
    [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
  )
  $out = Insert-AfterFirstHeading -Body $body -Insert $RunBlock
  if (-not $out.EndsWith("`n")) { $out += "`n" }
  [System.IO.File]::WriteAllText($DestPath, $out, [System.Text.UTF8Encoding]::new($false))
}

function Stage-SdkChapter {
  if (-not (Test-Path $SdkSrc)) {
    throw "missing SDK README: $SdkSrc"
  }
  $sdkDir = Split-Path $SdkDest -Parent
  if (-not (Test-Path $sdkDir)) {
    New-Item -ItemType Directory -Path $sdkDir -Force | Out-Null
  }
  $body = [System.IO.File]::ReadAllText($SdkSrc)
  $body = $body -replace "`r`n", "`n" -replace "`r", "`n"
  $run = @"

<div class="ebook-run">

**Reference:** ``@sdk`` · **Project:** ``web-app/sdk``

``````text
cd web-app
vp install
# import from "@sdk" in lab TypeScript
``````

<p class="ebook-source"><strong>Source:</strong> <code>web-app/sdk/README.md</code></p>

</div>

"@
  # Produce a fenced ```text block (six backticks above collapse poorly in some hosts)
  $run = $run.Replace("``````", '```')
  # Soften relative links that point outside the ebook tree
  $body = $body -replace '\]\(\.\./\.\./demos/?\)', '](../tracks/react.md)'
  $body = $body -replace '\]\(\.\./\.\./firmware-prebuilt/?\)', '](../flash-firmware.md)'
  $body = $body -replace '\]\(\.\./\.\./\.\./firmware-esp32-s3-dev[^\)]*\)', '](https://github.com/drsanti/firmware-esp32-s3-dev)'
  $body = [regex]::Replace(
    $body,
    ($script:MermaidFence + 'mermaid\s*\n([\s\S]*?)' + $script:MermaidFence),
    {
      param($m)
      $diagram = Repair-MermaidDiagram ($m.Groups[1].Value.Trim())
      return ($script:MermaidFence + 'mermaid' + "`n" + $diagram + "`n" + $script:MermaidFence)
    },
    [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
  )
  $out = Insert-AfterFirstHeading -Body $body -Insert $run
  if (-not $out.EndsWith("`n")) { $out += "`n" }
  [System.IO.File]::WriteAllText($SdkDest, $out, [System.Text.UTF8Encoding]::new($false))
  Write-Host "Staged SDK -> $SdkDest"
}

if (Test-Path $GenDir) {
  Remove-Item $GenDir -Recurse -Force
}
New-Item -ItemType Directory -Path $GenDir -Force | Out-Null

$summary = New-Object System.Collections.Generic.List[string]
$summary.Add('# Summary')
$summary.Add('')
$summary.Add('[Introduction](introduction.md)')
$summary.Add('[Reading order](reading-order.md)')
$summary.Add('[Boards and capabilities](boards-and-caps.md)')
$summary.Add('[Flash firmware](flash-firmware.md)')
$summary.Add('')

$tracks = @(
  @{
    Id        = 'web-app'
    Title     = 'Vanilla labs'
    Part      = 'vanilla'
    SourceDir = (Join-Path $WorkshopRoot 'web-app')
    RelPrefix = 'web-app'
  },
  @{
    Id        = 'demos'
    Title     = 'React labs'
    Part      = 'react'
    SourceDir = (Join-Path $WorkshopRoot 'demos\src\pages')
    RelPrefix = 'demos/src/pages'
  }
)

$missing = New-Object System.Collections.Generic.List[string]
$pageCount = 0

# Vanilla track first, then SDK, then React (reading order)
$tVanilla = $tracks[0]
$tReact = $tracks[1]

function Stage-Track {
  param($t, [System.Collections.Generic.List[string]]$summary, [ref]$pageCount, [System.Collections.Generic.List[string]]$missing)

  if (-not (Test-Path $t.SourceDir)) {
    throw "missing track folder: $($t.SourceDir)"
  }

  $summary.Add("# $($t.Title)")
  $summary.Add("- [$($t.Title)](tracks/$($t.Part).md)")

  $exercises = @(Get-ChildItem $t.SourceDir -Directory -Filter 'ex*' | Sort-Object Name)
  foreach ($ex in $exercises) {
    $readme = Join-Path $ex.FullName 'README.md'
    $relSource = "$($t.RelPrefix)/$($ex.Name)/README.md"
    $genExDir = Join-Path $GenDir "$($t.Part)/$($ex.Name)"
    $genExMd = Join-Path $genExDir 'index.md'
    $title = $ex.Name

    if (-not (Test-Path $readme)) {
      $missing.Add($relSource)
      $stub = @"
# $($ex.Name)

> Labsheet README is missing in the repo. Add ``$relSource``.

"@
      $run = New-RunBlock -TrackId $t.Id -Part $t.Part -ExName $ex.Name -RelSource $relSource -Badge '<span class="ebook-badge warn">missing README</span>'
      Write-StagedMarkdown -DestPath $genExMd -RunBlock $run -Body $stub -Part $t.Part
      $summary.Add("  - [$title](generated/$($t.Part)/$($ex.Name)/index.md)")
      $pageCount.Value++
      continue
    }

    $body = [System.IO.File]::ReadAllText($readme)
    $run = New-RunBlock -TrackId $t.Id -Part $t.Part -ExName $ex.Name -RelSource $relSource
    Write-StagedMarkdown -DestPath $genExMd -RunBlock $run -Body $body -Part $t.Part
    $summary.Add("  - [$title](generated/$($t.Part)/$($ex.Name)/index.md)")
    $pageCount.Value++
  }
  $summary.Add('')
}

Stage-Track -t $tVanilla -summary $summary -pageCount ([ref]$pageCount) -missing $missing

$summary.Add('# Reference')
$summary.Add('- [`@sdk` board link library](sdk/index.md)')
$summary.Add('')
Stage-SdkChapter

Stage-Track -t $tReact -summary $summary -pageCount ([ref]$pageCount) -missing $missing

$summaryPath = Join-Path $SrcDir 'SUMMARY.md'
[System.IO.File]::WriteAllText(
  $summaryPath,
  (($summary -join "`n") + "`n"),
  [System.Text.UTF8Encoding]::new($false)
)

$manifest = [ordered]@{
  generated_utc   = (Get-Date).ToUniversalTime().ToString('o')
  pages           = $pageCount
  missing_readmes = @($missing)
}
$manifestPath = Join-Path $GenDir 'manifest.json'
($manifest | ConvertTo-Json) | Set-Content -Path $manifestPath -Encoding utf8

Write-Host "Staged $pageCount pages -> $GenDir"
if ($missing.Count -gt 0) {
  Write-Host "WARN missing READMEs ($($missing.Count)):"
  $missing | ForEach-Object { Write-Host "  $_" }
}

$fail = 0
foreach ($t in $tracks) {
  foreach ($ex in @(Get-ChildItem $t.SourceDir -Directory -Filter 'ex*')) {
    $expect = Join-Path $GenDir "$($t.Part)/$($ex.Name)/index.md"
    if (-not (Test-Path $expect)) {
      Write-Host "FAIL no generated page for $($t.Id)/$($ex.Name)"
      $fail++
    }
  }
}
if (-not (Test-Path $SdkDest)) {
  Write-Host "FAIL SDK chapter missing"
  $fail++
}
if ($fail -gt 0) {
  throw "coverage failed: $fail item(s) missing pages"
}
Write-Host "Coverage OK"
