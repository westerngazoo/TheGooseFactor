#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

PID_FILE=.docusaurus-dev.pid
LOG_FILE=.docusaurus-dev.log

if [ ! -f "$PID_FILE" ]; then
  echo "No hay PID file ($PID_FILE). Nada que parar."
  exit 0
fi

pid="$(cat "$PID_FILE" 2>/dev/null || true)"
if [ -z "$pid" ]; then
  rm -f "$PID_FILE"
  echo "PID vacío; limpiado $PID_FILE"
  exit 0
fi

if kill -0 "$pid" 2>/dev/null; then
  kill "$pid" 2>/dev/null || true
  for _ in $(seq 1 20); do
    if ! kill -0 "$pid" 2>/dev/null; then
      break
    fi
    sleep 0.25
  done
fi

rm -f "$PID_FILE"

echo "OK: servidor detenido. (log: $LOG_FILE)"
