@echo off
if "%~1"=="" (
    echo Please drag and drop one or more text files onto this batch file.
    pause
    exit /b
)

set OUTPUT_DIR=%~dp1
set OUTPUT_DIR=%OUTPUT_DIR:~0,-1%
set SCRIPT_PATH=%~dp0wordlist_processor-FI.py

:process_files
if "%~1"=="" goto end
set INPUT_FILE=%~f1
echo Processing: %~nx1
python "%SCRIPT_PATH%" "%INPUT_FILE%" "%OUTPUT_DIR%"
shift
goto process_files

:end
pause 