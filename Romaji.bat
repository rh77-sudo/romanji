@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title Romaji

where node >nul 2>&1
if errorlevel 1 (
  echo Node.js is not installed or is not on PATH.
  echo Install Node.js, then try again.
  pause
  exit /b 1
)

where npm >nul 2>&1
if errorlevel 1 (
  echo npm is not installed or is not on PATH.
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo Installing dependencies. This only happens once...
  call npm install
  if errorlevel 1 (
    echo npm install failed.
    pause
    exit /b 1
  )
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\launch-romaji.ps1"
set "ERR=%ERRORLEVEL%"
if not "%ERR%"=="0" (
  echo.
  echo Romaji failed to start.
  pause
)
exit /b %ERR%
