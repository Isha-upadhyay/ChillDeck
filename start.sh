#!/bin/bash

echo "=========================================="
echo "  AI Slide Generator - Quick Start"
echo "=========================================="
echo ""

echo "[1/2] Starting Backend..."
cd backend

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate
echo "Installing/updating dependencies..."
pip install -q -r requirements.txt
echo ""
echo "Starting FastAPI server on http://localhost:8000"
gnome-terminal -- bash -c "uvicorn main:app --reload; exec bash" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd $(pwd) && source venv/bin/activate && uvicorn main:app --reload"' 2>/dev/null || \
xterm -e "cd $(pwd) && source venv/bin/activate && uvicorn main:app --reload" &

sleep 3

echo ""
echo "[2/2] Starting Frontend..."
cd ../frontend

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

echo ""
echo "Starting Next.js on http://localhost:3000"
gnome-terminal -- bash -c "npm run dev; exec bash" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd $(pwd) && npm run dev"' 2>/dev/null || \
xterm -e "cd $(pwd) && npm run dev" &

echo ""
echo "=========================================="
echo "  Both servers are starting!"
echo "=========================================="
echo ""
echo "Backend:  http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo ""

