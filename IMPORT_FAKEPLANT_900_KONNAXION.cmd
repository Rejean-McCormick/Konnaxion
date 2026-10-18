@echo off
setlocal EnableExtensions DisableDelayedExpansion
pushd "%~dp0backend"
if errorlevel 1 goto BACKEND_ERROR
where uv >nul 2>nul
if errorlevel 1 goto UV_ERROR

echo === KONNAXION : 900 PERSONAS FAKEPLANT - IMPORT CONFIRME ===
echo ATTENTION : ecriture PERSISTANTE dans la base Django active, possiblement Neon.
echo Compte synthetic klone sans mot de passe utilisable.
echo Aucun SSO ni connexion interactive active pour ces klones.
echo.
echo === PREVIEW DE LA BASE ACTIVE ===
uv run --no-sync python manage.py fakeplant_people
if errorlevel 1 goto PREVIEW_ERROR

echo.
echo Sauvegarde RECENTE de la base Konnaxion requise avant import.
set "SAUVEGARDE="
set /p "SAUVEGARDE=Pour confirmer la sauvegarde de Neon, taper SAUVEGARDE OK : "
if not "%SAUVEGARDE%"=="SAUVEGARDE OK" goto CANCEL
set "CONSENT="
set /p "CONSENT=Pour importer les personas FakePlant, taper IMPORTER 900 fakeplant : "
if not "%CONSENT%"=="IMPORTER 900 fakeplant" goto CANCEL

echo === IMPORT DANS LA BASE KONNAXION ACTIVE ===
uv run --no-sync python manage.py fakeplant_people --apply --confirm-fakeplant
if errorlevel 1 goto APPLY_ERROR

echo === POST-CONTROLE LECTURE SEULE ===
uv run --no-sync python manage.py fakeplant_people
set "RC=%ERRORLEVEL%"
if not "%RC%"=="0" echo [ALERTE] Import termine, post-controle non valide.
goto END

:BACKEND_ERROR
echo [ECHEC] Repertoire backend introuvable.
set "RC=1"
goto END
:UV_ERROR
echo [ECHEC] uv introuvable sur le PATH.
set "RC=1"
goto END
:PREVIEW_ERROR
echo [STOP] Preflight refuse. Aucun import lance.
set "RC=1"
goto END
:APPLY_ERROR
echo [ECHEC] Import Django. Verifier la transaction et l'etat des comptes.
set "RC=1"
goto END
:CANCEL
echo [ANNULE] Aucune ecriture lancee.
set "RC=2"
:END
popd
pause
exit /b %RC%
