@echo off
setlocal EnableExtensions
cd /d "%~dp0"
where pwsh.exe >nul 2>nul
if errorlevel 1 (
  echo [ERROR] PowerShell 7 ^(pwsh^) est requis.
  echo Le projet utilise deja PowerShell 7.
  pause
  exit /b 1
)
pwsh.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0START_KONNAXION_UNIVERSES_ONECLICK.ps1" %*
set "KX_RESULT=%ERRORLEVEL%"
if not "%KX_RESULT%"=="0" (
  echo.
  echo [ERROR] Demarrage interrompu. Voir le message ci-dessus.
  pause
  exit /b %KX_RESULT%
)
exit /b 0
