@echo off
setlocal
cd /d "%~dp0"
set "TOUR=%CD%\cinematic\tours\ethikos-v413\tour.preview.json"

if not exist "%TOUR%" set "TOUR=%CD%\cinematic\tours\ethikos-v413\tour.json"

echo ============================================================
echo   Konnaxion / Ethikos V4.1.3 - FULLPAGE FROM VIDEO TOUR V2
echo   SAME PYTHON / SAME CINEMATIC ENGINE AS VIDEO
echo ============================================================
echo.

if not exist "%TOUR%" (
  echo [ERREUR] Aucun tour Ethikos trouve.
  exit /b 2
)

echo [1/2] Validate with Cinematic Engine...
python -m cinematic_engine.cli validate "%TOUR%" --check-app
if errorlevel 1 (
  echo.
  echo [ERREUR] La validation Cinematic Engine a echoue.
  echo C'est exactement la meme commande Python que le runner video.
  exit /b 2
)

echo.
echo [2/2] Replay the proven video timeline and capture full pages...
python "cinematic\tools\capture_ethikos_fullpage_from_video_tour_v2.py"
if errorlevel 1 (
  echo.
  echo [ERREUR] La capture a echoue. Voir _ERROR.png dans le dossier de sortie si disponible.
  exit /b 1
)

echo.
echo ============================================================
echo   TERMINE
echo   cinematic\tours\ethikos-v413\screenshots-fullpage-from-video
echo ============================================================
exit /b 0
