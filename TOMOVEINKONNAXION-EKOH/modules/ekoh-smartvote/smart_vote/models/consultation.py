@echo off
REM =============================================================
REM  create_missing_ekoh_files.bat
REM  Creates EMPTY placeholder files still outstanding.
REM  No content, no comments—just stub files Git can track.
REM =============================================================

SETLOCAL
set MOD=modules\ekoh-smartvote

REM ---------- 1. Directories ----------
for %%D in (
    "%MOD%\smart_vote\models"
    "%MOD%\smart_vote\migrations"
    "%MOD%\ekoh\tasks"
    "%MOD%\ekoh"
    "%MOD%\ekoh\fixtures"
    ".github\workflows"
    "docs"
    "config"
) do if not exist "%%~D" md "%%~D"

REM ---------- 2. Empty files ----------
for %%F in (
    "%MOD%\smart_vote\models\consultation.py"
    "%MOD%\smart_vote\models\consultation_relevance.py"
    "%MOD%\smart_vote\migrations\0002_consultation.py"
    "%MOD%\ekoh\tasks\contextual.py"
    "%MOD%\ekoh\admin_partition.py"
    "config\settings_addons.py"
    "config\celery.py"
    "docs\openapi.yaml"
    ".github\workflows\secrets-example.yml"
    "%MOD%\ekoh\fixtures\isced_f_2013.json"
) do if not exist "%%~F" copy nul "%%~F" >nul

echo.
echo Empty placeholder files created.
ENDLOCAL
