@echo off
REM =========================================================
REM  create_ekoh_empty_scaffold.bat
REM  Creates every folder & EMPTY placeholder file
REM  needed for the EkoH-SmartVote module.
REM  Run from repo root:  C:\path\to\Konnaxion> create_ekoh_empty_scaffold.bat
REM =========================================================

SETLOCAL ENABLEDELAYEDEXPANSION
set MOD=modules\ekoh-smartvote

REM ------------------------------------------------------------------
REM 1. Directory tree
REM ------------------------------------------------------------------
for %%D in (
    "%MOD%\ekoh\migrations"
    "%MOD%\ekoh\management\commands"
    "%MOD%\ekoh\fixtures"
    "%MOD%\ekoh\services"
    "%MOD%\ekoh\serializers"
    "%MOD%\ekoh\views"
    "%MOD%\ekoh\tasks"
    "%MOD%\ekoh\tests"
    "%MOD%\smart_vote\migrations"
    "%MOD%\smart_vote\services"
    "%MOD%\smart_vote\serializers"
    "%MOD%\smart_vote\views"
    "%MOD%\smart_vote\tasks"
    "%MOD%\smart_vote\tests"
    "%MOD%\charts\ekoh-smartvote"
    "%MOD%\fixtures"
    "infra\db"
    ".github\workflows"
) do if not exist "%%~D" md "%%~D"

REM ------------------------------------------------------------------
REM 2. Empty root-level scaffold files
REM ------------------------------------------------------------------
for %%F in (pyproject.toml Makefile docker-compose.dev.yml ^
            .pre-commit-config.yaml ruff.toml Dockerfile.dev README.md) do (
  if not exist "%%F" type nul > "%%F"
)

REM ------------------------------------------------------------------
REM 3. Ekoh app stubs
REM ------------------------------------------------------------------
copy nul "%MOD%\ekoh\__init__.py" >nul
> "%MOD%\ekoh\apps.py" (
  echo from django.apps import AppConfig
  echo.
  echo class EkohConfig(AppConfig^):
  echo     default_auto_field = "django.db.models.BigAutoField"
  echo     name = "konnaxion.ekoh"
)
copy nul "%MOD%\ekoh\models.py" >nul
echo > "%MOD%\ekoh\urls.py"
echo > "%MOD%\ekoh\services\__init__.py"
echo > "%MOD%\ekoh\serializers\__init__.py"
echo > "%MOD%\ekoh\views\__init__.py"
echo > "%MOD%\ekoh\tasks\__init__.py"
echo > "%MOD%\ekoh\tests\__init__.py"
copy nul "%MOD%\ekoh\migrations\__init__.py" >nul
echo > "%MOD%\ekoh\migrations\0001_initial.py"

REM ------------------------------------------------------------------
REM 4. Smart-Vote app stubs
REM ------------------------------------------------------------------
copy nul "%MOD%\smart_vote\__init__.py" >nul
> "%MOD%\smart_vote\apps.py" (
  echo from django.apps import AppConfig
  echo.
  echo class SmartVoteConfig(AppConfig^):
  echo     default_auto_field = "django.db.models.BigAutoField"
  echo     name = "konnaxion.smart_vote"
)
copy nul "%MOD%\smart_vote\models.py" >nul
echo > "%MOD%\smart_vote\urls.py"
echo > "%MOD%\smart_vote\services\__init__.py"
echo > "%MOD%\smart_vote\serializers\__init__.py"
echo > "%MOD%\smart_vote\views\__init__.py"
echo > "%MOD%\smart_vote\tasks\__init__.py"
echo > "%MOD%\smart_vote\tests\__init__.py"
copy nul "%MOD%\smart_vote\migrations\__init__.py" >nul
echo > "%MOD%\smart_vote\migrations\0001_initial.py"

REM ------------------------------------------------------------------
REM 5. Charts, fixtures, infra placeholders
REM ------------------------------------------------------------------
echo "# Helm sub-chart values" > "%MOD%\charts\ekoh-smartvote\values.yaml"
echo "{}" > "%MOD%\fixtures\isced_f_2013.json"
echo "-- monthly partition helper" > "infra\db\partition_helper.sql"

REM ------------------------------------------------------------------
REM 6. CI workflow placeholder
REM ------------------------------------------------------------------
> ".github\workflows\ekoh-smartvote.yml" (
  echo name: ekoh-smartvote
  echo on: [push]
  echo jobs:
  echo   noop:
  echo     runs-on: ubuntu-latest
  echo     steps:
  echo       - run: echo CI skeleton
)

echo(
echo EkoH-SmartVote EMPTY scaffold created successfully.
echo Now open each placeholder file and paste in the real code.
ENDLOCAL
