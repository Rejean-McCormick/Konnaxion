param(
    [Parameter(Mandatory = $true)]
    [string]$Root,
    [switch]$Apply,
    [string]$IncludeActions = "alias-or-rename,map,rename,replace"  # add ,review to force impact routes
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Map = Join-Path $ScriptDir "konnaxion_endpoint_alignment_resolved.csv"
$Tool = Join-Path $ScriptDir "endpoint_corrector.py"

if (-not (Test-Path $Map)) {
  Write-Error "Mapping not found: $Map"
  exit 2
}
if (-not (Test-Path $Tool)) {
  Write-Error "Tool not found: $Tool"
  exit 2
}

# Choose Python launcher
$Python = "python"
try {
  $ver = & $Python --version 2>$null
} catch {
  $Python = "py"
}

Write-Host "[1/2] Dry-run preview..." -ForegroundColor Cyan
& $Python $Tool --mapping $Map --root $Root --dry-run `
  --write-patch (Join-Path $Root "konnaxion_endpoint_changes.patch") `
  --write-json (Join-Path $Root "konnaxion_endpoint_fix_report.json") `
  --include-actions $IncludeActions

Write-Host "Dry-run finished." -ForegroundColor Green
Write-Host ("- Patch: {0}" -f (Join-Path $Root "konnaxion_endpoint_changes.patch"))
Write-Host ("- Report: {0}" -f (Join-Path $Root "konnaxion_endpoint_fix_report.json"))

if ($Apply) {
  Write-Host "[2/2] Applying changes with backups (.bak)..." -ForegroundColor Cyan
  & $Python $Tool --mapping $Map --root $Root --backup `
    --write-json (Join-Path $Root "konnaxion_endpoint_fix_report.json") `
    --include-actions $IncludeActions
  Write-Host "Apply complete." -ForegroundColor Green
} else {
  Write-Host "To apply: .\apply_konnaxion_alignment.ps1 -Root `"$Root`" -Apply" -ForegroundColor Yellow
}
