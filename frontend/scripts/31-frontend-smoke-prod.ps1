# 31-frontend-smoke-prod.ps1
param(
  [ValidateSet('audit','gate')] [string]$Mode = 'gate'
)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$root = Resolve-Path "$PSScriptRoot\.."
Set-Location $root

function Wait-HttpOk([string]$url, [int]$timeoutSec = 60) {
  $sw = [System.Diagnostics.Stopwatch]::StartNew()
  while ($sw.Elapsed.TotalSeconds -lt $timeoutSec) {
    try {
      $r = Invoke-WebRequest -Uri $url -UseBasicParsing -Method Get -TimeoutSec 5
      if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 500) { return $true }
    } catch {}
    Start-Sleep -Seconds 1
  }
  throw "Timeout waiting for $url"
}

pnpm run routes:gen
pnpm run build

# Port C0 exclusif : ne pas tester une autre application déjà sur 21130.
if (Get-NetTCPConnection -LocalPort 21130 -State Listen -ErrorAction SilentlyContinue) {
  throw "Port 21130 déjà occupé : arrêt du smoke test, aucun basculement."
}

$proc = Start-Process -FilePath "cmd.exe" -ArgumentList "/c","pnpm","start" -NoNewWindow -PassThru
try {
  Wait-HttpOk "http://localhost:21130"
  if ($Mode -eq 'gate') { $env:SMOKE_GATE = '1' } else { Remove-Item Env:\SMOKE_GATE -ErrorAction SilentlyContinue }
  if ($Mode -eq 'gate') { pnpm run smoke:gate } else { pnpm run smoke:dev }
}
finally {
  if ($proc -and -not $proc.HasExited) { cmd /c "taskkill /PID $($proc.Id) /T /F" | Out-Null }
}
