#!/bin/bash
# Start Ollama and the local batch worker.

set -e

echo "🚀 Starting Ollama server..."
# Start Ollama with infinite keep-alive (model stays in memory)
OLLAMA_KEEP_ALIVE="${OLLAMA_KEEP_ALIVE:-5m}" ollama serve &
OLLAMA_PID=$!

# Wait for Ollama to be ready
echo "⏳ Waiting for Ollama server..."
for i in {1..30}; do
  if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "✅ Ollama server ready"
    break
  fi
  sleep 1
done

OLLAMA_MODEL="${OLLAMA_MODEL:-gemma3:4b}"
echo "📥 Ensuring Ollama model is cached: ${OLLAMA_MODEL}"
ollama pull "${OLLAMA_MODEL}"
echo "✅ Ollama model ready"

# Start worker
echo "🎬 Starting video worker..."
exec python3 -u worker.py

# If worker exits, stop Ollama
kill $OLLAMA_PID 2>/dev/null || true

