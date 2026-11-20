@echo off
setlocal EnableExtensions
REM C0: Konnaxion frontend owns 21130; never select a fallback port.
set "KX_FRONTEND_PORT=21130"
if not "%~1"=="" if not "%~1"=="21130" (
  echo [ERROR] Konnaxion frontend is reserved to port 21130 by C0.
  exit /b 2
)
set "NEXT_PUBLIC_KONNAXION_UNIVERSE_BASE_DOMAIN=localhost"
set "NEXT_PUBLIC_API_BASE=/api"
set "API_PROXY_BASE=http://127.0.0.1:21131/api"
powershell -NoProfile -Command "if (Get-NetTCPConnection -State Listen -LocalPort 21130 -ErrorAction SilentlyContinue) { exit 1 }"
if errorlevel 1 (
  echo [ERROR] Port 21130 already in use. No automatic fallback.
  exit /b 1
)
echo [INFO] Konnaxion Web: http://127.0.0.1:21130
pushd "%~dp0frontend"
where pnpm >nul 2>nul
if errorlevel 1 (
  call corepack enable
  if errorlevel 1 (popd & exit /b 1)
)
if not exist "node_modules" (
  call pnpm install
  if errorlevel 1 (popd & exit /b 1)
)
call pnpm exec cross-env FORCE_COLOR=1 next dev --turbo --hostname 127.0.0.1 -p 21130
set "KX_EXIT_CODE=%ERRORLEVEL%"
popd
endlocal & exit /b %KX_EXIT_CODE%
