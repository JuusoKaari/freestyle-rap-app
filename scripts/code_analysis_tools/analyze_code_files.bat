@echo off
REM Code File Line Count Analyzer - Windows Batch Runner
REM This script runs the Python analyzer for code files in the src folder

echo.
echo ===============================================
echo    Code File Line Count Analyzer
echo ===============================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.6+ and ensure it's in your PATH
    pause
    exit /b 1
)

REM Get the directory where this batch file is located
set SCRIPT_DIR=%~dp0

REM Change to the script directory
cd /d "%SCRIPT_DIR%"

REM Run the Python script
echo Running analysis...
echo.
python analyze_code_files.py

REM Check if the script ran successfully
if errorlevel 1 (
    echo.
    echo ERROR: The Python script encountered an error
) else (
    echo.
    echo Analysis completed successfully!
)

echo.
echo Press any key to exit...
pause >nul 