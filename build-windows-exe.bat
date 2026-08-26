@echo off
title Biddalok by SoftDows - Windows EXE Builder
echo ================================================================
echo           BIDDALOK - SCHOOL & INSTITUTION MANAGEMENT
echo                      by SoftDows
echo               Developer: Ansar Ahammad (01737011052)
echo ================================================================
echo.
echo [1/3] Checking Node.js dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies. Please ensure Node.js is installed.
    pause
    exit /b %errorlevel%
)

echo.
echo [2/3] Building Web Application Frontend...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Failed to compile React application.
    pause
    exit /b %errorlevel%
)

echo.
echo [3/3] Packaging Windows (.exe) Installer & Portable App...
call npm run electron:build:win
if %errorlevel% neq 0 (
    echo [ERROR] Failed to create .exe package.
    pause
    exit /b %errorlevel%
)

echo.
echo ================================================================
echo   BUILD COMPLETED SUCCESSFULLY!
echo   Your .exe files are ready in the "release" folder:
echo   - Biddalok by SoftDows Setup 1.0.0.exe  (Full NSIS Installer)
echo   - Biddalok by SoftDows 1.0.0.exe        (Portable Edition)
echo ================================================================
echo.
pause
