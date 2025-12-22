#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-3000}"
HOST="${HOST:-0.0.0.0}"

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Prefer nvm when available.
# Important: system Node on Ubuntu 20.04 can be very old (e.g. v10) and will not run Docusaurus v3.
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  # shellcheck disable=SC1090
  . "$NVM_DIR/nvm.sh"
  nvm use default >/dev/null 2>&1 || nvm use --lts >/dev/null 2>&1 || true
fi

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "ERROR: node/npm not found. Install Node via nvm in WSL (https://github.com/nvm-sh/nvm)." >&2
  exit 1
fi

# Ensure Node is modern enough for Docusaurus (requires Node >= 18).
node_major="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)"
if [ "${node_major:-0}" -lt 18 ]; then
  if command -v nvm >/dev/null 2>&1; then
    echo "WARN: Node $(node -v) is too old for Docusaurus; switching to nvm LTS..." >&2
    nvm install --lts >/dev/null 2>&1 || true
    nvm use --lts >/dev/null 2>&1 || true
  fi
  node_major="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)"
  if [ "${node_major:-0}" -lt 18 ]; then
    echo "ERROR: Node $(node -v) is too old. Use nvm to install/use Node >= 18." >&2
    exit 1
  fi
fi

PID_FILE=.docusaurus-dev.pid
LOG_FILE=.docusaurus-dev.log

if [ -f "$PID_FILE" ]; then
  existing_pid="$(cat "$PID_FILE" 2>/dev/null || true)"
  if [ -n "$existing_pid" ] && kill -0 "$existing_pid" 2>/dev/null; then
    echo "Docusaurus ya está corriendo (PID $existing_pid) en http://localhost:$PORT/"
    exit 0
  fi
  rm -f "$PID_FILE"
fi

# Start detached (WSL sometimes kills background jobs when wsl.exe exits; setsid is more robust)
if command -v setsid >/dev/null 2>&1; then
  setsid npm start -- --host "$HOST" --port "$PORT" > "$LOG_FILE" 2>&1 < /dev/null &
else
  nohup npm start -- --host "$HOST" --port "$PORT" > "$LOG_FILE" 2>&1 &
fi
echo $! > "$PID_FILE"

# Wait until it responds (or show logs)
for _ in $(seq 1 60); do
  if curl -fsS "http://127.0.0.1:$PORT/" >/dev/null 2>&1; then
    echo "OK: Docusaurus corriendo en http://localhost:$PORT/"
    exit 0
  fi
  sleep 0.5
done

echo "ERROR: el servidor no respondió en :$PORT" >&2
echo "--- Últimas líneas del log ($LOG_FILE) ---" >&2
tail -n 80 "$LOG_FILE" >&2 || true
exit 1
