<# repair_frontend.ps1
   Nettoie, répare PNPM/Corepack et réinstalle les dépendances du projet Next-Enterprise.
   Paramètres :
     -UseNode20      : bascule sur Node 20 (nécessite nvm-windows).
     -BypassCorepack : garde la version de Node mais désactive Corepack et installe PNPM globalement.
#>

param(
    [switch]$UseNode20 = $false,
    [switch]$BypassCorepack = $false
)

$ErrorActionPreference = "Stop"
Write-Host "`n=== Préparation de l’environnement ==="

# 1. Stop watchers éventuels
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process code -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. Aller à la racine du script (= projet)
Set-Location $PSScriptRoot

# 3. Nettoyage
Write-Host "`n--- Nettoyage du workspace ---"
if (Test-Path .\node_modules) {
    Remove-Item .\node_modules -Recurse -Force
}
Remove-Item .\pnpm-lock.yaml -ErrorAction SilentlyContinue

# 4. Gestion Node / PNPM
if ($UseNode20) {
    if (-not (Get-Command nvm -ErrorAction SilentlyContinue)) {
        throw "nvm-windows est requis pour -UseNode20 (https://github.com/coreybutler/nvm-windows)."
    }
    Write-Host "`n--- Installation / sélection de Node 20 LTS ---"
    nvm install 20 -SkipSSL -y | Out-Null
    nvm use 20 | Out-Null
    corepack enable
    corepack prepare pnpm@8.15.5 --activate
}
elseif ($BypassCorepack) {
    Write-Host "`n--- Désactivation de Corepack & installation globale de PNPM ---"
    corepack disable
    npm i -g pnpm@8
}
else {
    corepack enable
    corepack prepare pnpm@8.15.5 --activate
}

# 5. Vérification PNPM
$pver = pnpm --version
Write-Host "`nPNPM $pver prêt."

# 6. Installation des packages
Write-Host "`n--- Installation PNPM ---"
pnpm install

Write-Host "`n--- Ajout des dépendances manquantes ---"
pnpm add --% moment styled-components nookies @auth0/auth0-spa-js @ant-design/plots recharts react-map-gl

Write-Host "`n--- Ajout des typings DEV ---"
pnpm add -D --% @types/styled-components @types/react-map-gl

# 7. Vérifications TypeScript & lint
Write-Host "`n--- Vérification TypeScript ---"
pnpm exec tsc --noEmit

Write-Host "`n--- Lint ---"
pnpm run lint

Write-Host "`n✅  Script terminé : dépendances réinstallées et checks effectués."
