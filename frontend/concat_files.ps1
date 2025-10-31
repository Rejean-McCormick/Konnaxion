# concat_files.ps1
$paths = @(
    "next.config.ts",
    "app\layout.tsx",
    "app\page.tsx",
    "shared\layout\MainLayout.tsx",
    "modules\global\components\AppShell.tsx",
    "app\dashboard\page.tsx",
    "app\ekoh\page.tsx",
    "app\insights\page.tsx",
    "app\kreative\page.tsx",
    "app\konnected\page.tsx",
    "routes\routesEkoh.tsx",
    "routes\routesEthikos.tsx",
    "routes\routesKeenkonnect.tsx",
    "routes\routesKonnected.tsx",
    "routes\routesKreative.tsx",
    "context\ThemeContext.tsx",
    "src\theme\index.ts",
    "instrumentation.ts",
    "env.mjs",
    "package.json",
    ".env.local",
    "services\_request.ts",
    "shared\api.ts"
)

$outFile = "frontend_concat.txt"
Remove-Item $outFile -ErrorAction SilentlyContinue

foreach ($p in $paths) {
    $full = Join-Path $PSScriptRoot $p
    if (Test-Path $full) {
        Add-Content $outFile "`n=== FILE: $p ===`n"
        Get-Content $full | Add-Content $outFile
    } else {
        Add-Content $outFile "`n=== FILE NOT FOUND: $p ===`n"
    }
}

Write-Host "Concat done -> $outFile"
