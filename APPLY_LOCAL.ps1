param(
    [string]$Repo = "C:\mycode\Konnaxion\Konnaxion"
)

$ErrorActionPreference = "Stop"
$SeedSource = Join-Path $PSScriptRoot "backend\seed-data"
$Backend = Join-Path $Repo "backend"
$Python = Join-Path $Backend ".venv\Scripts\python.exe"

if (-not (Test-Path $Python)) { throw "Python venv introuvable: $Python" }
if (-not (Test-Path (Join-Path $Backend "manage.py"))) { throw "manage.py introuvable: $Backend" }

Write-Host "`n=== COPY MEGA SEEDS ==="
Copy-Item -Recurse -Force (Join-Path $SeedSource "universes\*") (Join-Path $Backend "seed-data\universes\")
Copy-Item -Recurse -Force (Join-Path $SeedSource "worlds\*") (Join-Path $Backend "seed-data\worlds\")

$Targets = @(
    @{ Key = "unesco";        Version = "1.5.0" },
    @{ Key = "cuba-2026";     Version = "0.3.0" },
    @{ Key = "kristal-farms"; Version = "0.5.0" },
    @{ Key = "levis";         Version = "0.5.0" }
)

Push-Location $Backend
try {
    foreach ($Target in $Targets) {
        Write-Host "`n============================================================"
        Write-Host "APPLY $($Target.Key) @ $($Target.Version)"
        Write-Host "============================================================"
        & $Python manage.py worlds_apply_universe $Target.Key --pack-version $Target.Version --promote
        if ($LASTEXITCODE -ne 0) { throw "worlds_apply_universe failed: $($Target.Key)" }
    }
}
finally {
    Pop-Location
}

Write-Host "`nMEGA UPDATE APPLIED. Run .\VERIFY_LOCAL.ps1"
