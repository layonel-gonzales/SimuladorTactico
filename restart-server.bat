@echo off
echo.
echo 🔄 Reiniciando servidor PWA del Simulador Tactico...
echo.

REM Cambiar al directorio del servidor
cd /d "c:\Users\layon\OneDrive\Escritorio\SimuladorTactico\server"

REM Matar procesos de Node existentes (opcional)
taskkill /f /im node.exe 2>nul

REM Esperar un poco
timeout /t 2 /nobreak >nul

echo 🚀 Iniciando servidor en puerto 3000...
echo.

REM Iniciar el servidor
node freemium-server.js

pause
