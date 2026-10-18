# Konnaxion local V3 — ONE CLICK. Only the first-time wiring changes files.
# Discovery is read-only. At server start, ONLY new Universe keys can be applied.
[CmdletBinding()]
param([switch]$CheckOnly, [switch]$NoAutoload)
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$repo = $PSScriptRoot
$backend = Join-Path $repo 'backend'
$worlds = Join-Path (Split-Path -Parent $repo) 'Konnaxion_Worlds'
$catalog = Join-Path $worlds 'universes'
$manager = Join-Path (Split-Path -Parent $repo) 'Konnaxion-Universe-Worlds-Manager'
$install = Join-Path $repo 'INSTALL_NESTED_UNIVERSES.ps1'
$checkWorlds = Join-Path $repo 'scripts\check_worlds_dependency.py'
$backendCmd = Join-Path $repo 'RUN_backend_local.bat'
$frontendCmd = Join-Path $repo 'RUN_frontend_local.bat'
$autoload = Join-Path $backend 'tools\universe_autoload.py'

function Phase([string] $value) { Write-Host "`n=== $value ===" -ForegroundColor Cyan }
function Require-File([string] $path) {
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { throw "Fichier manquant: $path" }
}
function Is-Listening([int] $port) {
    return @((Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue)).Count -gt 0
}
function Url-Ready([string] $url) {
    try {
        $r = Invoke-WebRequest -Uri $url -TimeoutSec 4 -MaximumRedirection 2 -ErrorAction Stop
        return $r.StatusCode -ge 200 -and $r.StatusCode -lt 400
    } catch { return $false }
}
function Await-Url([string] $url, [int] $seconds) {
    $deadline = (Get-Date).AddSeconds($seconds)
    while ((Get-Date) -lt $deadline) {
        if (Url-Ready $url) { return $true }
        Start-Sleep -Seconds 3
    }
    return $false
}

try {
    Phase '1/5 - Verification des 3 depots (lecture seule)'
    foreach ($file in @($install, $checkWorlds, $backendCmd, $frontendCmd, $autoload,
                         (Join-Path $repo 'WORLD_ENGINE.lock.json'),
                         (Join-Path $worlds 'backend\pyproject.toml'))) {
        Require-File $file
    }
    if (-not (Test-Path -LiteralPath $manager -PathType Container)) {
        Write-Host '[NOTE] Depot Manager absent; Konnaxion peut quand meme demarrer.' -ForegroundColor Yellow
    } elseif (-not (Test-Path -LiteralPath (Join-Path $manager 'Konnaxion_Universe_Worlds_Manager.pyw') -PathType Leaf)) {
        Write-Host '[NOTE] Le Manager est present mais son lanceur est absent.' -ForegroundColor Yellow
    }
    $uv = Get-Command uv -ErrorAction SilentlyContinue
    if (-not $uv) { throw 'uv introuvable dans PATH. Le backend Konnaxion utilise uv.' }
    if (-not (Get-Command pnpm -ErrorAction SilentlyContinue) -and -not (Get-Command corepack -ErrorAction SilentlyContinue)) {
        throw 'pnpm et corepack absents du PATH (frontend).'
    }

    $expected = @('unesco','cuba-2026','kristal-farms','levis','fakeplant','konvergence-koali')
    foreach ($key in $expected) { Require-File (Join-Path $catalog "$key\universe.yaml") }
    $universeFolders = @(Get-ChildItem -LiteralPath $catalog -Directory -ErrorAction Stop |
      Where-Object { Test-Path -LiteralPath (Join-Path $_.FullName 'universe.yaml') -PathType Leaf })
    $worldCount = 0
    foreach ($item in $universeFolders) {
        $folder = Join-Path $item.FullName 'worlds'
        if (-not (Test-Path -LiteralPath $folder -PathType Container)) {
            throw "Pas de Worlds dans l'Universe $($item.Name)"
        }
        $count = @(Get-ChildItem -LiteralPath $folder -Directory | Where-Object {
          (Test-Path -LiteralPath (Join-Path $_.FullName 'world.yaml') -PathType Leaf) -or
          (Test-Path -LiteralPath (Join-Path $_.FullName 'world.yml') -PathType Leaf)
        }).Count
        if ($count -lt 1) { throw "Aucun World valide: $($item.Name)" }
        $worldCount += $count
        Write-Host "  $($item.Name): $count Worlds"
    }
    if ($universeFolders.Count -lt 6 -or $worldCount -lt 55) {
        throw "Catalogue incomplet: $($universeFolders.Count) Universes / $worldCount Worlds, attendu >= 6 / 55"
    }

    Phase '2/5 - Verrou moteur 0.3.7 et securite du lancement'
    $venvPy = Join-Path $backend '.venv\Scripts\python.exe'
    $python = $null
    if (Test-Path -LiteralPath $venvPy -PathType Leaf) {
        $python = $venvPy
        $prefix = @()
    } else {
        if (-not (Get-Command py -ErrorAction SilentlyContinue)) {
            throw 'Python 3 introuvable pour verifier le verrou du moteur.'
        }
        $python = 'py'
        $prefix = @('-3')
    }
    & $python @prefix $checkWorlds $worlds
    if ($LASTEXITCODE -ne 0) { throw 'Konnaxion_Worlds et WORLD_ENGINE.lock.json divergent : refus.' }

    if (-not $CheckOnly -and (Is-Listening 8000)) {
        throw "Port 8000 deja occupe : fermer le backend Konnaxion existant et relancer ce double-clic. Aucun processus n'est arrete."
    }
    Write-Host 'Dossiers + empreinte moteur : PASS.' -ForegroundColor Green

    Phase '3/5 - Catalogue Django (lecture seule; 0 ecriture DB)'
    # Env vars exist only in this process, not in local.py; no configuration write yet.
    $savedWorld = [Environment]::GetEnvironmentVariable('KONNAXION_WORLD_SEED_ROOT', 'Process')
    $savedUniverse = [Environment]::GetEnvironmentVariable('KONNAXION_UNIVERSE_SEED_ROOT', 'Process')
    try {
        $env:KONNAXION_WORLD_SEED_ROOT = $catalog
        $env:KONNAXION_UNIVERSE_SEED_ROOT = $catalog
        if (Test-Path -LiteralPath $venvPy -PathType Leaf) {
            Push-Location $backend
            try {
                & $venvPy $autoload
                if ($LASTEXITCODE -ne 0) { throw 'Catalogue/backend incoherents, autoload refuse avant installation.' }
            } finally { Pop-Location }
        } else {
            Write-Host '[NOTE] .venv absente : verification Django differee au lancement backend.' -ForegroundColor Yellow
        }
    } finally {
        [Environment]::SetEnvironmentVariable('KONNAXION_WORLD_SEED_ROOT', $savedWorld, 'Process')
        [Environment]::SetEnvironmentVariable('KONNAXION_UNIVERSE_SEED_ROOT', $savedUniverse, 'Process')
    }

    if ($CheckOnly) {
        Phase 'Controle seul TERMINE'
        Write-Host 'Aucun fichier modifie, aucune ecriture DB, aucun serveur demarre.' -ForegroundColor Green
        exit 0
    }

    Phase '4/5 - Raccordement du lanceur et des settings (sauvegardes automatiques)'
    & pwsh.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File $install -Apply
    if ($LASTEXITCODE -ne 0) {
        throw "INSTALL_NESTED_UNIVERSES.ps1 a echoue (exit $LASTEXITCODE)"
    }
    # The installer is idempotent. It creates dated backups when it changes two files.
    $launcherText = [IO.File]::ReadAllText($backendCmd)
    $settingsText = [IO.File]::ReadAllText((Join-Path $backend 'config\settings\local.py'))
    if (-not $launcherText.Contains('REM KX_NESTED_UNIVERSES_V3') -or
        -not $settingsText.Contains('# KX_NESTED_UNIVERSES_V3')) {
        throw 'Configuration V3 non confirmee apres installateur.'
    }

    Phase '5/5 - Demarrage des deux serveurs'
    $env:KX_AUTOLOAD_NEW_UNIVERSES = if ($NoAutoload) { '0' } else { '1' }
    if ($NoAutoload) {
        Write-Host 'MODE VERIFICATION : nouveaux Universes NON charges en base.' -ForegroundColor Yellow
    } else {
        Write-Host 'MODE NORMAL : seulement les NOUVEAUX Universes seront autocharges en base.' -ForegroundColor Yellow
        Write-Host 'Les Universes existants ne sont ni supprimes ni repromus.'
    }
    $backendProcess = Start-Process -FilePath $env:ComSpec -ArgumentList @('/k', ('call "{0}"' -f $backendCmd)) -WorkingDirectory $repo -PassThru
    Write-Host "Backend : fenetre ouverte (PID $($backendProcess.Id)); attente HTTP..."
    if (-not (Await-Url 'http://127.0.0.1:8000/api/control/universes/' 480)) {
        throw 'Backend non pret apres 8 minutes. Lire les erreurs dans la fenetre Backend; elle reste ouverte.'
    }
    Write-Host 'Backend API : PASS' -ForegroundColor Green

    $port = 3000
    while ($port -le 3099 -and (Is-Listening $port)) { $port++ }
    if ($port -gt 3099) { throw 'Ports frontend 3000..3099 occupes; backend reste ouvert.' }
    $frontProcess = Start-Process -FilePath $env:ComSpec -ArgumentList @('/k', ('call "{0}" {1}' -f $frontendCmd, $port)) -WorkingDirectory $repo -PassThru
    $url = "http://localhost:$port/"
    Write-Host "Frontend : fenetre ouverte (PID $($frontProcess.Id)); attente $url ..."
    if (-not (Await-Url $url 300)) {
        throw 'Frontend non pret apres 5 minutes. Lire la fenetre Frontend; backend reste ouvert.'
    }
    Write-Host "KONNAXION PRET : $url" -ForegroundColor Green
    Start-Process $url
    Write-Host 'Les deux fenetres serveurs doivent rester ouvertes.'
    exit 0
} catch {
    Write-Host "`nECHEC : $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Aucun dossier Universe ni World existant n'a ete supprime par ce lanceur." -ForegroundColor Yellow
    exit 1
}
