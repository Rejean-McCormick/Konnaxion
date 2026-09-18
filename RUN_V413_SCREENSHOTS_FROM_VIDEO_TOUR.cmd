@echo off
setlocal
cd /d "%~dp0"

echo ============================================================
echo   Konnaxion / Ethikos V4.1.3 - Screenshots FROM VIDEO TOUR
echo   SCRIPT: ETHIKOS_FULLPAGE_FROM_VIDEO_TOUR_V1
echo ============================================================
echo.

if not exist "cinematic\tours\ethikos-v413\timeline.json" (
  echo [ERREUR] timeline.json introuvable.
  exit /b 2
)
if not exist "cinematic\tours\ethikos-v413\targets.json" (
  echo [ERREUR] targets.json introuvable.
  exit /b 2
)

python -c "import cinematic_engine, playwright" >nul 2>&1
if errorlevel 1 (
  echo [ERREUR] Utilise le meme environnement Python que celui qui fait fonctionner RUN_V413_PREVIEW_WITH_OVERLAY.cmd.
  exit /b 2
)

python "cinematic\tools\capture_ethikos_fullpage_from_video_tour.py"
if errorlevel 1 (
  echo.
  echo [ERREUR] La capture a echoue.
  exit /b 1
)

echo.
echo ============================================================
echo   TERMINE
echo   cinematic\tours\ethikos-v413\screenshots-fullpage-from-video
echo ============================================================
exit /b 0
