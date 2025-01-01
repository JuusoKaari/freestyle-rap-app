@echo off
if "%~1"=="" (
    echo Please drag and drop one or more vocabulary JS files onto this batch file.
    pause
    exit /b
)

set SCRIPT_PATH=%~dp0populate_rhyme_groups-EN.py

:process_files
if "%~1"=="" goto end
set INPUT_FILE=%~f1
echo Processing: %~nx1
python "%SCRIPT_PATH%" "%INPUT_FILE%"
shift
goto process_files

:end
pause 