# Yerel PostgreSQL hazirlama yardimcisi (Windows / PowerShell).
# Parolayi guvenli sekilde sorar ve postgres_bootstrap.sql betigini calistirir.
# Mevcut database/kullaniciya dokunmaz (betik idempotent ve non-destructive).

param(
    [string]$SuperUser = "postgres",
    [string]$PgHost = "localhost",
    [int]$Port = 5432
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
    Write-Error "psql PATH'te bulunamadi. PostgreSQL client araclarini kurun veya PATH'e ekleyin."
    exit 1
}

$secure = Read-Host "ai_platform_user icin yeni uygulama parolasi" -AsSecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try {
    $appPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
} finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
}

$scriptPath = Join-Path $PSScriptRoot "postgres_bootstrap.sql"

Write-Host "PostgreSQL hazirlaniyor ($PgHost`:$Port, superuser=$SuperUser)..."
psql -U $SuperUser -h $PgHost -p $Port -v "app_password=$appPassword" -f $scriptPath

Write-Host "Tamamlandi. DATABASE_URL icine bu parolayi yazmayi unutmayin (.env)."
