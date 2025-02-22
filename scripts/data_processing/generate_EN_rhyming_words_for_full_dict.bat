@echo off
setlocal enabledelayedexpansion

rem Get the directory where this script is located
set "SCRIPT_DIR=%~dp0"
rem Remove trailing backslash
set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"

echo Running English rhyming words generator...
python "%SCRIPT_DIR%\generate_EN_rhyming_words_for_full_dict.py"

echo.
echo Process complete!
pause 