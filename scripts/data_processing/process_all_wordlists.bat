@echo off
setlocal enabledelayedexpansion

rem Get the directory where this script is located
set "SCRIPT_DIR=%~dp0"
rem Remove trailing backslash
set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"

rem Set paths relative to workspace root
set "WORDLISTS_DIR=%SCRIPT_DIR%\..\..\src\data\vocabulary\raw_wordlists"
set "OUTPUT_DIR=%SCRIPT_DIR%\..\..\src\data\vocabulary"
set "FI_SCRIPT=%SCRIPT_DIR%\wordlist_processor-FI.py"
set "EN_SCRIPT=%SCRIPT_DIR%\wordlist_processor-EN.py"

echo Processing all wordlists from: %WORDLISTS_DIR%
echo Output directory: %OUTPUT_DIR%
echo.

rem Process each .txt file in the wordlists directory
for %%F in ("%WORDLISTS_DIR%\*.txt") do (
    set "FILENAME=%%~nxF"
    echo Processing: !FILENAME!
    
    rem Check if filename starts with FI_ or EN_
    if "!FILENAME:~0,3!"=="FI_" (
        echo Using Finnish processor
        python "%FI_SCRIPT%" "%%F" "%OUTPUT_DIR%"
    ) else if "!FILENAME:~0,3!"=="EN_" (
        echo Using English processor
        python "%EN_SCRIPT%" "%%F" "%OUTPUT_DIR%"
    ) else (
        echo Warning: !FILENAME! does not start with FI_ or EN_, skipping...
    )
    echo.
)

echo All files processed!
pause 