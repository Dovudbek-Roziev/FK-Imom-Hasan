@echo off
title Imom Hasan Football - Dev Server

echo Backend ishga tushmoqda...
start "Backend" cmd /k "cd /d C:\Users\User\Desktop\Imom^ Hasan^ Football\backend && npm start"

timeout /t 3 /nobreak > nul

echo Metro ishga tushmoqda...
start "Metro" cmd /k "cd /d C:\Users\User\Desktop\Imom^ Hasan^ Football\frontend && npx react-native start"

timeout /t 5 /nobreak > nul

echo Port forwarding...
C:\Users\User\AppData\Local\Android\Sdk\platform-tools\adb.exe reverse tcp:8081 tcp:8081

echo.
echo Hammasi tayyor! Telefonda ilovani oching.
pause
