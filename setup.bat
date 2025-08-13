@echo off
echo ========================================
echo AI Document Chat - Setup Script
echo ========================================
echo.

echo This script will help you set up the AI Document Chat application.
echo.
echo Prerequisites:
echo 1. Python 3.8+ must be installed
echo 2. Node.js 16+ must be installed  
echo 3. Ollama must be installed and running
echo.

echo Checking Python installation...
python --version
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)

echo.
echo Checking Node.js installation...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 16+ from https://nodejs.org
    pause
    exit /b 1
)

echo.
echo Checking npm installation...
npm --version
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed
    pause
    exit /b 1
)

echo.
echo ========================================
echo Setting up Backend...
echo ========================================

cd backend

echo Creating virtual environment...
python -m venv venv

echo Activating virtual environment...
call venv\Scripts\activate

echo Installing Python dependencies...
pip install -r ..\requirements.txt

if %errorlevel% neq 0 (
    echo ERROR: Failed to install Python dependencies
    pause
    exit /b 1
)

echo Backend setup complete!
echo.

cd ..

echo ========================================
echo Setting up Frontend...
echo ========================================

cd frontend

echo Installing Node.js dependencies...
npm install

if %errorlevel% neq 0 (
    echo ERROR: Failed to install Node.js dependencies
    pause
    exit /b 1
)

echo Frontend setup complete!
echo.

cd ..

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Make sure Ollama is installed and running
echo 2. Pull a model: ollama pull llama2
echo 3. Start the backend: run start_backend.bat
echo 4. Start the frontend: run start_frontend.bat
echo 5. Open http://localhost:3000 in your browser
echo.
echo For detailed instructions, see README.md
echo.

pause 