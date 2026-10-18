# Run in Konnaxion repository. PREVIEW is default, -Apply updates only launcher/local settings.
# No universe, World, or database record is written by this installer.
[CmdletBinding()]
param([switch]$Apply)
$ErrorActionPreference = 'Stop'
$repo = $PSScriptRoot
$launcher = Join-Path $repo 'RUN_backend_local.bat'
$settings = Join-Path $repo 'backend\config\settings\local.py'
$loader = Join-Path $repo 'backend\tools\universe_autoload.py'
$engine = Join-Path (Split-Path -Parent $repo) 'Konnaxion_Worlds'
$root = Join-Path $engine 'universes'
if (!(Test-Path $launcher) -or !(Test-Path $settings) -or !(Test-Path $loader)) { throw 'Konnaxion cible incomplet.' }
foreach($key in @('unesco','cuba-2026','kristal-farms','levis','fakeplant','konvergence-koali')) {
    if (!(Test-Path (Join-Path $root "$key\universe.yaml"))) { throw "Manifeste manquant: $key dans $root" }
}
$bat = [IO.File]::ReadAllText($launcher)
$local = [IO.File]::ReadAllText($settings)
$tagBat='REM KX_NESTED_UNIVERSES_V3'
$tagLocal='# KX_NESTED_UNIVERSES_V3'
if ($bat.Contains($tagBat) -xor $local.Contains($tagLocal)) {
    throw 'Installation V3 partielle detectee: aucune modification; demander une inspection.'
}
if ($bat.Contains($tagBat)) {
    Write-Host 'Deja installe (V3) : aucune modification.' -ForegroundColor Green
    exit 0
}
# Remove only known V1 blocks, preserve everything before and after.
if ($bat.Contains('REM Canonical Universe startup discovery V1')) {
    $old='(?s)REM Canonical Universe startup discovery V1.*?(?=echo \[INFO\] Applying migrations\.\.\.)'
    if ([regex]::Matches($bat,$old).Count -ne 1) { throw 'Bloc V1 du launcher non reconnu.' }
    $bat=[regex]::Replace($bat,$old,'')
}
if ($bat.Contains('REM New-only dev autoload:')) {
    $old='(?s)REM New-only dev autoload:.*?(?=echo \[INFO\] Starting backend on http://127\.0\.0\.1:8000)'
    if ([regex]::Matches($bat,$old).Count -ne 1) { throw 'Bloc autoload V1 non reconnu.' }
    $bat=[regex]::Replace($bat,$old,'')
}
$beforeMig='echo [INFO] Applying migrations...'
$beforeServer='echo [INFO] Starting backend on http://127.0.0.1:8000 ...'
if ([regex]::Matches($bat,[regex]::Escape($beforeMig)).Count -ne 1 -or [regex]::Matches($bat,[regex]::Escape($beforeServer)).Count -ne 1) {
    throw 'Marqueurs du launcher manquants; aucune modification.'
}
$pre=@'
REM KX_NESTED_UNIVERSES_V3
REM One Universe directory contains its Worlds, no seed-data sibling layout.
set "KONNAXION_WORLD_SEED_ROOT=%~dp0..\Konnaxion_Worlds\universes"
set "KONNAXION_UNIVERSE_SEED_ROOT=%~dp0..\Konnaxion_Worlds\universes"
if not exist "%KONNAXION_UNIVERSE_SEED_ROOT%\fakeplant\universe.yaml" (
  echo [ERROR] Canonical nested Universe catalog not found.
  pause
  exit /b 1
)

'@
$post=@'
REM KX_NESTED_AUTOLOAD_V3: new keys only; set KX_AUTOLOAD_NEW_UNIVERSES=0 for preview.
if not defined KX_AUTOLOAD_NEW_UNIVERSES set "KX_AUTOLOAD_NEW_UNIVERSES=1"
if "%KX_AUTOLOAD_NEW_UNIVERSES%"=="1" (
  ".venv\Scripts\python.exe" "%~dp0backend\tools\universe_autoload.py" --apply-new
) else (
  ".venv\Scripts\python.exe" "%~dp0backend\tools\universe_autoload.py"
)
if errorlevel 1 (
  echo [ERROR] Nested Universe catalog validation/load failed; server not started.
  pause
  exit /b 1
)

'@
$bat=$bat.Replace($beforeMig,($pre -replace "`r?`n","`r`n")+"`r`n"+$beforeMig)
$bat=$bat.Replace($beforeServer,($post -replace "`r?`n","`r`n")+"`r`n"+$beforeServer)
# The old V1 local settings appended a block; the new explicit block wins in dev
# even when V1 is still present. The launcher forces matching ENV for its session.
$localAddition=@'

# KX_NESTED_UNIVERSES_V3
# Runtime source for local uv and Django commands (independent of launcher).
# Production configuration is not changed by this installer.
_KX_UNIVERSE_ROOT_V3 = BASE_DIR.parent.parent / "Konnaxion_Worlds" / "universes"
if _KX_UNIVERSE_ROOT_V3.is_dir():
    KONNAXION_WORLD_SEED_ROOT = str(_KX_UNIVERSE_ROOT_V3)
    KONNAXION_UNIVERSE_SEED_ROOT = str(_KX_UNIVERSE_ROOT_V3)
'@
if (!$local.Contains('from .base import *')) { throw 'Settings local.py non reconnus.' }
$local=$local.TrimEnd()+$localAddition+"`n"
Write-Host "Repo: $repo"
Write-Host "Worlds/Universes: $root"
Write-Host 'Preview: launcher et local settings seront sauvegardes puis ajustes; DB inchangee.'
if (!$Apply) { Write-Host 'PREVIEW ONLY. Ajouter -Apply apres verification.'; exit 0 }
$stamp=Get-Date -Format 'yyyyMMdd-HHmmss'
Copy-Item $launcher "$launcher.bak-nested-$stamp"
Copy-Item $settings "$settings.bak-nested-$stamp"
[IO.File]::WriteAllText($launcher,$bat,[Text.UTF8Encoding]::new($false))
[IO.File]::WriteAllText($settings,$local,[Text.UTF8Encoding]::new($false))
Write-Host 'INSTALLATION CONFIG V3 OK: sauvegardes creees; aucune ecriture DB.' -ForegroundColor Green
