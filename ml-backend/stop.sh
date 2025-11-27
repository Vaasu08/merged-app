#!/bin/bash
# Stop ML Backend Server

PID_FILE="/tmp/ml-backend.pid"

if [ ! -f "$PID_FILE" ]; then
    echo "ℹ️  ML Backend is not running (no PID file found)"
    exit 0
fi

PID=$(cat "$PID_FILE")

if ps -p $PID > /dev/null 2>&1; then
    kill $PID
    echo "🛑 Stopped ML Backend (PID: $PID)"
    rm -f "$PID_FILE"
else
    echo "ℹ️  ML Backend was not running (stale PID file)"
    rm -f "$PID_FILE"
fi
