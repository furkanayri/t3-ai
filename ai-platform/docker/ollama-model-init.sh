#!/bin/sh
# Ollama hazir olduktan sonra OLLAMA_MODEL'i (idempotent) indirir.
set -e

: "${OLLAMA_HOST:=http://ollama:11434}"
: "${OLLAMA_MODEL:=gemma3:12b-it-q4_K_M}"
export OLLAMA_HOST

echo "Ollama bekleniyor ($OLLAMA_HOST)..."
i=0
until ollama list >/dev/null 2>&1; do
  i=$((i + 1))
  if [ "$i" -gt 60 ]; then
    echo "HATA: Ollama hazir olmadi" >&2
    exit 1
  fi
  sleep 2
done

echo "Model indiriliyor (zaten varsa atlanir): $OLLAMA_MODEL"
ollama pull "$OLLAMA_MODEL"
echo "Model hazir: $OLLAMA_MODEL"
