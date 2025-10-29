<#
    migrate-ui-v1-to-v14.ps1   —   version sans erreur « paramètre #3 »
#>

# ---- chemins racine -----------------------------------------------
$srcRoot = "C:\MonCode\K-Avec-Interface-avancee\V1\Front"
$dstRoot = "C:\MonCode\KonnaxionV14\next-enterprise"

if (-not (Test-Path $srcRoot)) {
    Write-Error "Chemin source introuvable : $srcRoot"
    exit 1
}

# ---- listes de dossiers -------------------------------------------
$domains    = "ekoh","ethikos","keenkonnect","konnected","kreative"
$globalDirs = "components","context","hooks","services","theme","routes","public"

# Options robocopy : tableau = un argument par élément
$roboOpts = @("/E", "/XO", "/NJH", "/NJS", "/NP")

# ---- fonction utilitaire ------------------------------------------
function Copy-Folder($src, $dst) {
    if (Test-Path $src) {
        # Crée la destination si nécessaire
        $null = New-Item -ItemType Directory -Path $dst -Force
        robocopy $src $dst @roboOpts | Out-Null
    }
}

# ---- copie des domaines -------------------------------------------
foreach ($d in $domains) {
    $srcApp = Join-Path $srcRoot ("app\$d")
    $dstMod = Join-Path $dstRoot ("modules\$d")
    Write-Host "`n[DOMAIN] $d"
    Copy-Folder $srcApp $dstMod

    # legacy -pages
    $srcLegacy = Join-Path $srcRoot ("-pages\$d")
    $dstLegacy = Join-Path $dstMod  "legacy-pages"
    Copy-Folder $srcLegacy $dstLegacy
}

# ---- copie des dossiers globaux -----------------------------------
foreach ($g in $globalDirs) {
    $srcDir = Join-Path $srcRoot $g
    $dstDir = Join-Path $dstRoot $g
    Write-Host "`n[GLOBAL] $g"
    Copy-Folder $srcDir $dstDir
}

Write-Host "`n--- Migration UI terminée ---`n"
