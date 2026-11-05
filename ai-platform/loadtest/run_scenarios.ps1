# 10 parametreli yuk testi senaryosu (Windows PowerShell).
#
# Kullanim:
#   $env:LOADTEST_API_KEY = "<key_id>.<secret>"
#   ./loadtest/run_scenarios.ps1 -Host "http://localhost:8080"
#
# Her senaryo loadtest/reports/ altina HTML + CSV rapor yazar (gitignore'da).

param(
    [string]$Host = "http://localhost:8080",
    [string]$RunTime = "1m"
)

if (-not $env:LOADTEST_API_KEY) {
    Write-Error "LOADTEST_API_KEY tanimli degil. Once bir API anahtari olusturup ortam degiskenine atayin."
    exit 1
}

$reportDir = Join-Path $PSScriptRoot "reports"
New-Item -ItemType Directory -Force -Path $reportDir | Out-Null

# name, users, spawn-rate, prompt-chars, use-schema, max-output, poll
$scenarios = @(
    @{ name = "01-smoke";              users = 1;   spawn = 1;   chars = 100;   schema = "0"; out = 64;  poll = "1" },
    @{ name = "02-baseline-10u";       users = 10;  spawn = 5;   chars = 200;   schema = "0"; out = 128; poll = "1" },
    @{ name = "03-ramp-50u";           users = 50;  spawn = 10;  chars = 200;   schema = "0"; out = 128; poll = "1" },
    @{ name = "04-ramp-100u";          users = 100; spawn = 20;  chars = 200;   schema = "0"; out = 128; poll = "1" },
    @{ name = "05-spike-200u";         users = 200; spawn = 100; chars = 200;   schema = "0"; out = 128; poll = "1" },
    @{ name = "06-large-prompt";       users = 30;  spawn = 10;  chars = 4000;  schema = "0"; out = 256; poll = "1" },
    @{ name = "07-structured-output";  users = 30;  spawn = 10;  chars = 300;   schema = "1"; out = 256; poll = "1" },
    @{ name = "08-create-only";        users = 50;  spawn = 25;  chars = 200;   schema = "0"; out = 128; poll = "0" },
    @{ name = "09-poll-heavy";         users = 20;  spawn = 10;  chars = 150;   schema = "0"; out = 128; poll = "1" },
    @{ name = "10-sustained-stress";   users = 150; spawn = 30;  chars = 500;   schema = "0"; out = 256; poll = "1" }
)

foreach ($s in $scenarios) {
    Write-Host "=== Senaryo: $($s.name) (users=$($s.users)) ===" -ForegroundColor Cyan
    $env:LOADTEST_PROMPT_CHARS = "$($s.chars)"
    $env:LOADTEST_USE_SCHEMA = "$($s.schema)"
    $env:LOADTEST_MAX_OUTPUT = "$($s.out)"
    $env:LOADTEST_POLL = "$($s.poll)"

    $html = Join-Path $reportDir "$($s.name).html"
    $csv = Join-Path $reportDir "$($s.name)"

    locust -f (Join-Path $PSScriptRoot "locustfile.py") `
        --host $Host `
        --users $s.users --spawn-rate $s.spawn --run-time $RunTime `
        --headless --only-summary `
        --html $html --csv $csv
}

Write-Host "Tum senaryolar tamamlandi. Raporlar: $reportDir" -ForegroundColor Green
