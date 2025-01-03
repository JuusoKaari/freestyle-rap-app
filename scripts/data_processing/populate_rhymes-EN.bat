@echo off
if "%~1"=="" (
    echo Please drag and drop a text file onto this batch file.
    pause
    exit /b
)

set INPUT_FILE=%~f1
set OUTPUT_DIR=%~dp1
set OUTPUT_DIR=%OUTPUT_DIR:~0,-1%
set SCRIPT_PATH=%~dp0populate_rhyme_groups-EN.py

echo Processing: %~nx1
python "%SCRIPT_PATH%" "%INPUT_FILE%" "%OUTPUT_DIR%"
pause 