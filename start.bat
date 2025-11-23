@echo off
echo ==========================================
echo   AI Slide Generator - Quick Start
echo ==========================================
echo.

echo [1/2] Starting Backend...
cd backend
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)
call venv\Scripts\activate
echo Installing/updating dependencies...
pip install -q -r requirements.txt
echo.
echo Starting FastAPI server on http://localhost:8000
start cmd /k "uvicorn main:app --reload"
timeout /t 3 /nobreak >nul

echo.
echo [2/2] Starting Frontend...
cd ..\frontend
if not exist node_modules (
    echo Installing dependencies...
    call npm install
)
echo.
echo Starting Next.js on http://localhost:3000
start cmd /k "npm run dev"

echo.
echo ==========================================
echo   Both servers are starting!
echo ==========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause >nul

