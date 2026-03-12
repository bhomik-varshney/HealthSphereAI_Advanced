#!/bin/bash

# HealthSphere AI - Startup Script
# This script starts both the Flask backend and React frontend

echo "🏥 Starting HealthSphere AI..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "api.py" ]; then
    echo "❌ Error: api.py not found. Please run this script from the project root."
    exit 1
fi

# Start backend
echo -e "${BLUE}📡 Starting Flask API Backend...${NC}"
echo "   URL: http://localhost:5000"
echo ""

# Activate virtual environment if it exists
if [ -d ".venv" ]; then
    source .venv/bin/activate
fi

# Start Flask in background
python api.py &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
echo ""

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
sleep 3

# Check if backend is running
if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is ready!${NC}"
else
    echo -e "${YELLOW}⚠ Backend might still be starting...${NC}"
fi
echo ""

# Start frontend
echo -e "${BLUE}🌐 Starting React Frontend...${NC}"
echo "   URL: http://localhost:5173"
echo ""

cd healthsphere-ui
npm run dev &
FRONTEND_PID=$!

echo ""
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"
echo ""
echo "═══════════════════════════════════════════════════"
echo -e "${GREEN}🎉 HealthSphere AI is running!${NC}"
echo ""
echo "📱 Frontend: http://localhost:5173"
echo "📡 Backend:  http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop both services"
echo "═══════════════════════════════════════════════════"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✓ All services stopped"
    exit 0
}

# Trap Ctrl+C and call cleanup
trap cleanup INT TERM

# Wait for both processes
wait
