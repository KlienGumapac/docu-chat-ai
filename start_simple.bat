@echo off
echo Starting AI Document Chat (Simple Version)
echo.

echo Starting Backend...
start "Backend" cmd /k "cd /d %~dp0 && python simple_backend.py"

echo Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak > nul

echo Starting Frontend...
start "Frontend" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo Both services are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Please wait for both to fully load, then open http://localhost:3000
pause 