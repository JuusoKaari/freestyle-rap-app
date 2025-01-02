@echo off
if "%~1"=="" (
    echo Please drag and drop one or more vocabulary JS files onto this batch file.
    pause
    exit /b
)

set SCRIPT_PATH=%~dp0combine_vocabulary.py

echo Processing files...
python "%SCRIPT_PATH%" %*

echo.
pause 