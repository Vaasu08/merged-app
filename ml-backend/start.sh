#!/bin/bash
# Start ML Backend Server

BACKEND_DIR="/home/mitul/merged-app/ml-backend"
LOG_FILE="/tmp/ml-backend.log"
PID_FILE="/tmp/ml-backend.pid"

# Check if already running
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p $PID > /dev/null 2>&1; then
        echo "✅ ML Backend is already running (PID: $PID)"
        echo "📡 Server: http://localhost:8000"
        echo "📚 API Docs: http://localhost:8000/docs"
        exit 0
    fi
fi

echo "🚀 Starting ML Backend..."

cd "$BACKEND_DIR"
nohup "$BACKEND_DIR/venv/bin/python" app.py > "$LOG_FILE" 2>&1 &
PID=$!
echo $PID > "$PID_FILE"

# Wait a moment for server to start
sleep 2

# Check if server is running
if ps -p $PID > /dev/null 2>&1; then
    echo "✅ ML Backend started successfully!"
    echo "   PID: $PID"
    echo "   Server: http://localhost:8000"
    echo "   API Docs: http://localhost:8000/docs"
    echo "   Logs: $LOG_FILE"
else
    echo "❌ Failed to start ML Backend"
    echo "Check logs: tail -f $LOG_FILE"
    rm -f "$PID_FILE"
    exit 1
fi
