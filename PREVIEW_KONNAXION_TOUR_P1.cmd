@echo off
setlocal
cd /d "%~dp0"
where python >nul 2>nul
if not errorlevel 1 (
  python -B "%~dp0tools\tandem_tour\patch.py" preview
) else (
  where py >nul 2>nul
  if not errorlevel 1 (
    py -3 -B "%~dp0tools\tandem_tour\patch.py" preview
  ) else (
    echo [ERREUR] Python 3 introuvable. Ouvrir dans PowerShell 7 avec Python.
    exit /b 2
  )
)
set "RC=%ERRORLEVEL%"
if not "%RC%"=="0" echo [ECHEC] Aucun deploiement lance.
pause
exit /b %RC%
