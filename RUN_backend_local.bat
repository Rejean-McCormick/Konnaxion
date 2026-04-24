@echo off
setlocal

pushd "%~dp0backend"

where uv >nul 2>nul
if errorlevel 1 (
  echo [ERROR] uv is not installed or not in PATH.
  exit /b 1
)

if not exist ".venv\Scripts\python.exe" (
  echo [INFO] Creating Python 3.12 virtual environment...
  uv venv .venv --python 3.12
  if errorlevel 1 exit /b 1
)

echo [INFO] Installing dependencies...
uv pip install -r requirements\local.txt
if errorlevel 1 exit /b 1

echo [INFO] Applying migrations...
uv run python manage.py migrate
if errorlevel 1 exit /b 1

echo [INFO] Starting backend on http://127.0.0.1:8000 ...
uv run python -m uvicorn config.asgi:application --host 0.0.0.0 --port 8000 --reload
if errorlevel 1 exit /b 1

popd
endlocal