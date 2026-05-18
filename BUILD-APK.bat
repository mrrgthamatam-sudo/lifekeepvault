@echo off
title LifeKeepVault — Mobile APK Builder
color 0E

echo.
echo  ================================================================
echo       LIFEKEEPVAULT — Mobile APK Builder
echo  ================================================================
echo.
echo  Press any key to start...
pause > nul

:: Change to the directory where this BAT file is located
cd /d "%~dp0"

echo.
echo  Working from: %CD%
echo.

call node build-mobile.cjs

echo.
pause > nul
