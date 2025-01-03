@echo off
if "%~1"=="" (
    echo Please drag and drop one or more text files onto this batch file.
    pause
    exit /b
)

set SCRIPT_PATH=%~dp0combine_txt_to_wordlist.py

echo Processing files...
python "%SCRIPT_PATH%" %*

echo.
pause 