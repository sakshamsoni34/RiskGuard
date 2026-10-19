#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "=========================================================="
echo "🛡️  RiskGuard Investigator — Starting Bare-Metal Stack"
echo "=========================================================="

cleanup() {
  echo ""
  echo "Shutting down background services..."
  kill $(jobs -p) 2>/dev/null || true
  exit 0
}

trap cleanup SIGINT SIGTERM EXIT

echo "[1/3] Starting ML Microservice on port 8000..."
cd "$ROOT_DIR/ml-service"
./venv/bin/python -m uvicorn src.main:app --host 0.0.0.0 --port 8000 &
PID_ML=$!

echo "[2/3] Starting Core Investigator Backend on port 9000..."
cd "$ROOT_DIR"
./backend/venv/bin/python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 9000 &
PID_BACKEND=$!

echo "[3/3] Starting Next.js Frontend on port 3000..."
cd "$ROOT_DIR/frontend"
npm run dev &
PID_FRONTEND=$!

echo ""
echo "✅ All 3 services are booting up!"
echo "   - Frontend UI:  http://localhost:3000"
echo "   - Core Backend: http://localhost:9000"
echo "   - ML Engine:    http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop all services."

wait
