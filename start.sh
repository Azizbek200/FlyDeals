#!/bin/bash

# Deals App Startup Script
# This script helps you start both backend and frontend servers

set -e

echo "🚀 Starting Deals App..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if PostgreSQL is running
echo "Checking PostgreSQL..."
if command -v pg_isready &> /dev/null; then
    if pg_isready -q; then
        echo -e "${GREEN}✓${NC} PostgreSQL is running"
    else
        echo -e "${RED}✗${NC} PostgreSQL is not running"
        echo ""
        echo "Please start PostgreSQL first:"
        echo "  brew services start postgresql@15"
        echo "  or: brew services start postgresql@16"
        echo "  or start Postgres.app"
        exit 1
    fi
else
    echo -e "${YELLOW}!${NC} Cannot verify PostgreSQL status"
    echo "Make sure PostgreSQL is running before continuing"
    echo ""
fi

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}✗${NC} backend/.env not found"
    echo "Please run setup first or see SETUP.md"
    exit 1
fi

if [ ! -f "frontend/.env.local" ]; then
    echo -e "${RED}✗${NC} frontend/.env.local not found"
    echo "Please run setup first or see SETUP.md"
    exit 1
fi

echo -e "${GREEN}✓${NC} Environment files found"
echo ""

# Check if database exists
DB_EXISTS=$(psql -lqt 2>/dev/null | cut -d \| -f 1 | grep -w deals | wc -l | xargs)
if [ "$DB_EXISTS" -eq "0" ]; then
    echo -e "${YELLOW}!${NC} Database 'deals' not found"
    echo "Creating database..."
    createdb deals 2>/dev/null && echo -e "${GREEN}✓${NC} Database created" || echo -e "${RED}✗${NC} Failed to create database"
    echo ""
fi

echo "Starting servers..."
echo ""
echo -e "${BLUE}Backend:${NC}  http://localhost:8080"
echo -e "${BLUE}Frontend:${NC} http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup EXIT INT TERM

# Start backend
cd backend
echo "Starting backend..."
./run.sh &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend
cd ../frontend
echo "Starting frontend..."
npm run dev &
FRONTEND_PID=$!

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
