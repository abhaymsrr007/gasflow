# Local Postgres Setup Script
# Usage: .\scripts\local-db\setup.ps1 -SuperUserPassword <your_postgres_password>

param (
    [Parameter(Mandatory=$true)]
    [string]$SuperUserPassword
)

$ErrorActionPreference = "Stop"

# 1. Read .env
if (-not (Test-Path ".env")) {
    Write-Error ".env file not found! Copy .env.example to .env first."
}

$envContent = Get-Content ".env"
$appPw = ($envContent | Select-String "^GASFLOW_APP_PASSWORD=").ToString().Split("=",2)[1]
$ownerPw = ($envContent | Select-String "^GASFLOW_OWNER_PASSWORD=").ToString().Split("=",2)[1]

if (-not $appPw -or -not $ownerPw) {
    Write-Error "GASFLOW_APP_PASSWORD or GASFLOW_OWNER_PASSWORD missing in .env"
}

# 2. Create DB if not exists (Using default postgres db)
Write-Host "Checking if database 'gasflow' exists..."
$env:PGPASSWORD = $SuperUserPassword
$dbExists = & psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='gasflow'"

if (-not $dbExists) {
    Write-Host "Creating database 'gasflow'..."
    & psql -U postgres -c "CREATE DATABASE gasflow;"
} else {
    Write-Host "Database 'gasflow' already exists."
}

# 3. Run setup.sql
Write-Host "Applying roles and security..."
& psql -U postgres -d gasflow -v ON_ERROR_STOP=1 -v app_pw="$appPw" -v owner_pw="$ownerPw" -f "scripts/local-db/setup.sql"

$env:PGPASSWORD = $null
Write-Host "Local Database setup complete!"
Write-Host "You can now connect using gasflow_owner or gasflow_app."