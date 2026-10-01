@echo off
setlocal EnableExtensions

rem Konnaxion local frontend launcher.
rem - Keeps existing services (for example Orgo) untouched.
rem - Uses port 3000 when free.
rem - Otherwise selects the first free port from 3001..3099.
rem - Pass an explicit port as the first argument to require that port.

set "KX_FRONTEND_PORT="
set "KX_FRONTEND_PORT_EXPLICIT=0"

rem Force local browser/API routing so dev never falls back to production hosts.
set "NEXT_PUBLIC_KONNAXION_UNIVERSE_BASE_DOMAIN=localhost"
set "NEXT_PUBLIC_API_BASE=/api"
set "API_PROXY_BASE=http://127.0.0.1:8000/api"

if not "%~1"=="" (
  set "KX_FRONTEND_PORT=%~1"
  set "KX_FRONTEND_PORT_EXPLICIT=1"
)

if "%KX_FRONTEND_PORT_EXPLICIT%"=="1" (
  powershell -NoProfile -Command "$p=%KX_FRONTEND_PORT%; if (Get-NetTCPConnection -State Listen -LocalPort $p -ErrorAction SilentlyContinue) { exit 1 }"
  if errorlevel 1 (
    echo [ERROR] Port %KX_FRONTEND_PORT% is already in use.
    echo [ERROR] Konnaxion will not stop or replace the service that owns it.
    exit /b 1
  )
) else (
  for /f %%P in ('powershell -NoProfile -Command "$p=3000; while ($p -le 3099 -and (Get-NetTCPConnection -State Listen -LocalPort $p -ErrorAction SilentlyContinue)) { $p++ }; if ($p -gt 3099) { exit 1 }; $p"') do set "KX_FRONTEND_PORT=%%P"
  if not defined KX_FRONTEND_PORT (
    echo [ERROR] No free frontend port found in range 3000-3099.
    exit /b 1
  )
)

if not "%KX_FRONTEND_PORT%"=="3000" (
  echo [INFO] Port 3000 is already in use. Existing service left untouched.
)

echo [INFO] Konnaxion frontend: http://localhost:%KX_FRONTEND_PORT%
echo [INFO] Universe hosts:     http://^<universe^>.localhost:%KX_FRONTEND_PORT%
echo [INFO] Universe base:      %NEXT_PUBLIC_KONNAXION_UNIVERSE_BASE_DOMAIN%
echo [INFO] API proxy:          %API_PROXY_BASE%

pushd "%~dp0frontend"

where pnpm >nul 2>nul
if errorlevel 1 (
  call corepack enable
  if errorlevel 1 (
    popd
    exit /b 1
  )
)

if not exist "node_modules" (
  call pnpm install
  if errorlevel 1 (
    popd
    exit /b 1
  )
)

call pnpm exec cross-env FORCE_COLOR=1 next dev --turbo -p %KX_FRONTEND_PORT%
set "KX_EXIT_CODE=%ERRORLEVEL%"

popd
endlocal & exit /b %KX_EXIT_CODE%
