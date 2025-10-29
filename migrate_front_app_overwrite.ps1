# migrate_front_app_overwrite.ps1
# Copie (en écrasant) app\{ekoh,ethikos,keenkonnect,konnected,kreative} → next-enterprise\modules\*

$ErrorActionPreference = 'Stop'

# 1) Racines
$SRC_APP = "C:\MonCode\K-Avec-Interface-avancee\V1\Front\app"
$DST_MOD = "C:\MonCode\KonnaxionV14\next-enterprise\modules"
$STAMP   = Get-Date -Format "yyyyMMdd-HHmm"
$BU_DIR  = "C:\MonCode\KonnaxionV14\BU-preMergeUI\overwrite-$STAMP"

# 2) Modules à migrer (les 5)
$modules = @('ekoh','ethikos','keenkonnect','konnected','kreative')

# 3) Prépare sauvegarde
New-Item -ItemType Directory -Force -Path $BU_DIR | Out-Null

# Robocopy options: MIRROR + silencieux + pas de node_modules/.next si présents
$opts = @('/MIR','/XD','node_modules','.next','/NFL','/NDL','/NJH','/NJS','/NP')

foreach ($m in $modules) {
  $src = Join-Path $SRC_APP $m
  $dst = Join-Path $DST_MOD $m
  if (-not (Test-Path $src)) {
    Write-Warning "Source absente: $src  → ignoré"
    continue
  }

  # 3.a Sauvegarde du dossier destination (s'il existe)
  if (Test-Path $dst) {
    $dstBackup = Join-Path $BU_DIR "$m-backup"
    Write-Host "Sauvegarde: $dst  →  $dstBackup"
    robocopy $dst $dstBackup @($opts -ne '/MIR') | Out-Null  # copie simple
  }

  # 3.b Écrasement par la source
  Write-Host "Écrase: $src  →  $dst"
  New-Item -ItemType Directory -Force -Path $dst | Out-Null
  robocopy $src $dst $opts | Out-Null
}

Write-Host "`nOK. Sauvegardes dans: $BU_DIR"
Write-Host "Ensuite:"
Write-Host "  cd C:\MonCode\KonnaxionV14\next-enterprise"
Write-Host "  npm install"
Write-Host "  npx tsc --noEmit && npm run lint && npm run dev"
