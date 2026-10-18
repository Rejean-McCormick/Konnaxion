@echo off
setlocal EnableExtensions DisableDelayedExpansion
pushd "%~dp0backend"
if errorlevel 1 goto BACKEND_ERROR
where uv >nul 2>nul
if errorlevel 1 goto UV_ERROR

echo === KONNAXION : FAKEPLANT 900 - PREVIEW BASE ACTIVE ===
echo Aucun import, aucune migration, aucune modification de base.
uv run --no-sync python manage.py fakeplant_people
set "RC=%ERRORLEVEL%"
if not "%RC%"=="0" echo [ECHEC] Preflight refuse. Aucun import lance.
goto END

:BACKEND_ERROR
echo [ECHEC] Repertoire backend introuvable.
set "RC=1"
goto END
:UV_ERROR
echo [ECHEC] uv introuvable sur le PATH.
set "RC=1"
:END
popd
pause
exit /b %RC%
