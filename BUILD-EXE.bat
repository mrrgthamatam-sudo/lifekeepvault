@echo off
title LifeKeepVault — Install on This PC
color 0E

echo.
echo  ==============================================================
echo.
echo       LIFEKEEPVAULT — Install on This PC
echo       Secure Family Legacy Registry
echo.
echo   This will:
echo     1. Build the app
echo     2. Install to your system
echo     3. Create Desktop shortcut
echo     4. Create Start Menu entry
echo     5. Launch the app
echo.
echo  ==============================================================
echo.
echo  Requires: Node.js from https://nodejs.org (LTS version)
echo.
echo  Press any key to begin installation...
pause > nul

echo.
echo  Installing dependencies ...
echo.
call npm install
if %errorlevel% neq 0 (
    echo  ERROR: npm install failed.
    echo  Download Node.js from https://nodejs.org first.
    pause
    exit /b 1
)

echo.
echo  Building and installing LifeKeepVault ...
echo  (This takes 3-5 minutes on first run)
echo.
call node build-and-install.cjs
if %errorlevel% neq 0 (
    echo  Something went wrong. Check the messages above.
    pause
    exit /b 1
)

pause > nul
