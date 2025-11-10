@echo off
setlocal enableextensions

rem ==== Paramètres ====
set "DEST=C:\MyCode\backupsCumulKv14devOk"
rem Source = dossier où se trouve ce script
set "SRC=%~dp0"
for %%i in ("%SRC:~0,-1%") do set "PROJNAME=%%~nxi"

rem Horodatage
for /f %%I in ('powershell -NoProfile -Command "(Get-Date).ToString(\"yyyy-MM-dd_HHmmss\")"') do set "TS=%%I"

set "BACKUP_DIR=%DEST%\%PROJNAME%_%TS%"
if not exist "%DEST%" mkdir "%DEST%"
mkdir "%BACKUP_DIR%" >nul 2>&1

echo Source: "%SRC%"
echo Cible : "%BACKUP_DIR%"

rem Copie sans retour à la ligne (pas de ^) + log
robocopy "%SRC%" "%BACKUP_DIR%" /E /R:1 /W:1 /NFL /NDL /NP /LOG+:"%BACKUP_DIR%\backup.log" /TEE /XD node_modules .next .swc artifacts "scripts\artifacts" playwright-report /XF tsconfig.tsbuildinfo *.log *.tmp .last-run.json use_client_report.csv use_client_report.json

set "RC=%ERRORLEVEL%"
echo Code de sortie Robocopy: %RC%
if %RC% LSS 8 (
  echo Sauvegarde OK -> "%BACKUP_DIR%"
) else (
  echo Erreur. Voir le log: "%BACKUP_DIR%\backup.log"
)

pause
endlocal
