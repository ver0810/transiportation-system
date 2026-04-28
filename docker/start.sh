#!/bin/sh
set -eu

if [ -z "${DATABASE_URL:-}" ]; then
  echo "Missing DATABASE_URL"
  exit 1
fi

if [ -z "${JWT_SECRET_KEY:-}" ]; then
  echo "Missing JWT_SECRET_KEY"
  exit 1
fi

export CORS_ORIGINS="${CORS_ORIGINS:-http://localhost,http://127.0.0.1,http://localhost:80}"
export VITE_API_BASE_URL="${VITE_API_BASE_URL:-http://127.0.0.1:8000}"
export VITE_WS_BASE_URL="${VITE_WS_BASE_URL:-ws://127.0.0.1:8000/ws}"

cd /app/backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

cd /app/frontend-dist
python -m http.server 80 &
FRONTEND_PID=$!

cleanup() {
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
}

trap cleanup INT TERM
wait "$BACKEND_PID" "$FRONTEND_PID"
