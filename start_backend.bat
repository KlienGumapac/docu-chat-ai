@echo off
echo Starting AI Document Chat Backend...
echo.

cd backend

echo Creating virtual environment...
python -m venv venv

echo Activating virtual environment...
call venv\Scripts\activate

echo Installing dependencies...
pip install -r ..\requirements.txt

echo Starting FastAPI server...
python main.py

pause 