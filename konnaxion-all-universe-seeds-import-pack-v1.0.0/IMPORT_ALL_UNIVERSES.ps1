$ErrorActionPreference = "Stop"
$Python = if ($env:PYTHON_BIN) { $env:PYTHON_BIN } else { "python" }

if (-not (Test-Path "backend/manage.py")) {
    throw "Run this script from the Konnaxion repository root."
}

Push-Location backend
try {
    & $Python manage.py worlds_apply_universe unesco --version 1.4.0 --promote
    & $Python manage.py worlds_apply_universe cuba-2026 --version 0.2.0 --promote
    & $Python manage.py worlds_apply_universe kristal-farms --version 0.4.0 --promote
    & $Python manage.py worlds_apply_universe levis --version 0.4.0 --promote
}
finally {
    Pop-Location
}
