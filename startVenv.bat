@echo off
:: Check for administrator privileges
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Running as Administrator...
) else (
    echo This script needs to run as Administrator. Restarting with admin rights...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

:: Navigate to project directory
cd /d C:\MonCode\KonnaxionV2\konnaxion_project

:: Create virtual environment using Python 3.11
echo Creating virtual environment with Python 3.11...
py -3.11 -m venv venv

:: Activate the virtual environment
echo Activating virtual environment...
call venv\Scripts\activate



echo Setup Complete!
pause
