@echo off
setlocal

pushd "%~dp0backend"

if not exist ".venv\Scripts\python.exe" (
    python -m venv .venv
)

call ".venv\Scripts\activate.bat"

python -m pip install --upgrade pip
pip install -r requirements\local.txt

python manage.py migrate
python -m uvicorn config.asgi:application --host 0.0.0.0 --port 8000 --reload

popd
endlocal