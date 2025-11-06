# tools/full-scan.ps1
# Exécute tous les checks et écrit les rapports dans .\reports\
# Usage:  pwsh -NoProfile -ExecutionPolicy Bypass -File tools/full-scan.ps1

$ErrorActionPreference = "Continue"
$root = (Get-Location).Path
$reports = Join-Path $root "reports"

if (Test-Path $reports) { Remove-Item -Recurse -Force $reports }
New-Item -ItemType Directory -Force -Path $reports | Out-Null

function Run-Step([string]$name, [string]$cmd, [string]$outfile) {
  Write-Host "▶ $name"
  # On capture stdout+stderr et on ne stoppe pas sur code retour non‑zéro
  cmd.exe /c $cmd 2>&1 | Tee-Object -File (Join-Path $reports $outfile) | Out-Null
  $code = $LASTEXITCODE
  Add-Content -Path (Join-Path $reports "_summary.txt") -Value ("[{0}] exit={1}" -f $name, $code)
}

# 1) TypeScript (liste TOUTES les erreurs)
Run-Step "TypeScript" "pnpm exec tsc -p tsconfig.json --noEmit --pretty false" "1_typescript.txt"

# 2) ESLint (si installé)
if (Test-Path ".\node_modules\.bin\eslint.cmd") {
  Run-Step "ESLint" "pnpm exec eslint . --ext .ts,.tsx --max-warnings=0 -f codeframe" "2_eslint.txt"
} else {
  Add-Content (Join-Path $reports "_summary.txt") "ESLint: SKIPPED (non installé)"
}

# 3) Build Next (erreurs de bundling)
Run-Step "Next build" "set CI=1 && pnpm exec next build" "3_next_build.txt"

# 4) Jest (si présent)
if (Test-Path ".\node_modules\.bin\jest.cmd") {
  Run-Step "Jest" "pnpm exec jest --passWithNoTests" "4_jest.txt"
} else {
  Add-Content (Join-Path $reports "_summary.txt") "Jest: SKIPPED (non installé)"
}

# 5) Playwright SMOKE (si présent)
if (Test-Path ".\node_modules\.bin\playwright.cmd") {
  # Adapter le -g "SMOKE" à votre tag; sinon exécute tout
  Run-Step "Playwright SMOKE" "pnpm exec playwright test -g SMOKE --reporter=line" "5_playwright_smoke.txt"
} else {
  Add-Content (Join-Path $reports "_summary.txt") "Playwright: SKIPPED (non installé)"
}

# 6) Scan patterns PowerShell (anti-patterns ciblés)
$patterns = @(
  @{ name="router.query";             rx="router\.query" },
  @{ name="moment import/use";        rx="\bmoment\b" },
  @{ name="TextArea autosize";        rx="\bautosize\s*=" },
  @{ name="ProTable render(v)";       rx="render:\s*\(v" },
  @{ name="Countdown value non-number"; rx="Statistic\.Countdown\s*value=\{[^}]+\}" },
  @{ name="useRequest<1 generic>";    rx="useRequest<[^,>]+>" },
  @{ name="legacy api import";        rx="from\s+['""](\.\.\/)+api['""]" }
)

$scanFile = Join-Path $reports "6_patterns.txt"
"### Pattern scan" | Out-File $scanFile -Encoding utf8

Get-ChildItem -Recurse -Include *.ts,*.tsx | ForEach-Object {
  $file = $_.FullName
  $text = Get-Content -Raw -LiteralPath $file
  foreach ($p in $patterns) {
    $m = [regex]::Matches($text, $p.rx, "IgnoreCase")
    if ($m.Count -gt 0) {
      Add-Content $scanFile ("`n-- {0}`n{1}" -f $file, $p.name)
      $lines = Get-Content -LiteralPath $file
      foreach ($match in $m) {
        $lineNum = ($lines | Select-String -SimpleMatch $match.Value).LineNumber | Select-Object -First 1
        Add-Content $scanFile ("  L{0}: {1}" -f ($lineNum), $match.Value.Trim())
      }
    }
  }
}

Write-Host ""
Write-Host "=== Résumé ==="
Get-Content (Join-Path $reports "_summary.txt")
Write-Host "Rapports dans: $reports"
