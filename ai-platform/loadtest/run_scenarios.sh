#!/usr/bin/env bash
# 10 parametreli yuk testi senaryosu (Linux/macOS).
#
# Kullanim:
#   export LOADTEST_API_KEY="<key_id>.<secret>"
#   ./loadtest/run_scenarios.sh http://localhost:8080 1m
#
# Her senaryo loadtest/reports/ altina HTML + CSV rapor yazar (gitignore'da).

set -euo pipefail

HOST="${1:-http://localhost:8080}"
RUN_TIME="${2:-1m}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPORT_DIR="${HERE}/reports"
mkdir -p "${REPORT_DIR}"

if [[ -z "${LOADTEST_API_KEY:-}" ]]; then
  echo "LOADTEST_API_KEY tanimli degil." >&2
  exit 1
fi

# name users spawn chars schema out poll
SCENARIOS=(
  "01-smoke 1 1 100 0 64 1"
  "02-baseline-10u 10 5 200 0 128 1"
  "03-ramp-50u 50 10 200 0 128 1"
  "04-ramp-100u 100 20 200 0 128 1"
  "05-spike-200u 200 100 200 0 128 1"
  "06-large-prompt 30 10 4000 0 256 1"
  "07-structured-output 30 10 300 1 256 1"
  "08-create-only 50 25 200 0 128 0"
  "09-poll-heavy 20 10 150 0 128 1"
  "10-sustained-stress 150 30 500 0 256 1"
)

for row in "${SCENARIOS[@]}"; do
  read -r name users spawn chars schema out poll <<<"${row}"
  echo "=== Senaryo: ${name} (users=${users}) ==="
  export LOADTEST_PROMPT_CHARS="${chars}"
  export LOADTEST_USE_SCHEMA="${schema}"
  export LOADTEST_MAX_OUTPUT="${out}"
  export LOADTEST_POLL="${poll}"

  locust -f "${HERE}/locustfile.py" \
    --host "${HOST}" \
    --users "${users}" --spawn-rate "${spawn}" --run-time "${RUN_TIME}" \
    --headless --only-summary \
    --html "${REPORT_DIR}/${name}.html" --csv "${REPORT_DIR}/${name}"
done

echo "Tum senaryolar tamamlandi. Raporlar: ${REPORT_DIR}"
