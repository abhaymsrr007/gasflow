$scriptContent = @'
# ==============================================================================
# GASFlow - One-Click Local Database Setup
# ==============================================================================
$ErrorActionPreference = "Stop"
Clear-Host
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "       GASFlow - Local Database Setup Tool" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

$envPath = Join-Path $PWD ".env"
if (-not (Test-Path $envPath)) {
    Write-Host "ERROR: .env file nahi mili!" -ForegroundColor Red
    Read-Host "Enter dabakar exit karein..."; exit
}

$envContent = Get-Content $envPath
$appPwLine = $envContent | Where-Object { $_ -match "^GASFLOW_APP_PASSWORD=" }
$ownerPwLine = $envContent | Where-Object { $_ -match "^GASFLOW_OWNER_PASSWORD=" }

if (-not $appPwLine -or -not $ownerPwLine) {
    Write-Host "ERROR: .env mein GASFLOW_APP_PASSWORD ya GASFLOW_OWNER_PASSWORD nahi mila." -ForegroundColor Red
    Read-Host "Enter dabakar exit karein..."; exit
}

$appPw = ($appPwLine -split "=", 2)[1].Trim()
$ownerPw = ($ownerPwLine -split "=", 2)[1].Trim()

if ($appPw -match "CHANGE_ME" -or $ownerPw -match "CHANGE_ME") {
    Write-Host "WARNING: .env mein passwords abhi bhi 'CHANGE_ME' hain." -ForegroundColor Yellow
    Read-Host "Enter dabakar exit karein..."; exit
}

Write-Host "Tumhare local Postgres ke 'postgres' (superuser) ka password chahiye." -ForegroundColor Yellow
$secureSuperPw = Read-Host "Enter Superuser Password" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureSuperPw)
$superPw = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
[System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)

if (-not (Get-Command "psql" -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: 'psql' command nahi mila! PostgreSQL ka bin folder PATH mein add karo." -ForegroundColor Red
    Read-Host "Enter dabakar exit karein..."; exit
}

Write-Host ""
Write-Host "Step 1: Database check/create kar rahe hain..." -ForegroundColor Cyan
$env:PGPASSWORD = $superPw

$dbExists = & psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='gasflow'"
if ($dbExists -ne "1") {
    Write-Host "   -> Database 'gasflow' naya bana rahe hain..." -ForegroundColor Yellow
    & psql -U postgres -c "CREATE DATABASE gasflow;"
} else {
    Write-Host "   -> Database 'gasflow' pehle se maujood hai." -ForegroundColor Green
}

Write-Host "Step 2: Roles (gasflow_owner, gasflow_app) aur security apply kar rahe hain..." -ForegroundColor Cyan

$sqlScript = @"
\set ON_ERROR_STOP on

DO `$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'gasflow_owner') THEN
        CREATE ROLE gasflow_owner LOGIN PASSWORD '$ownerPw';
    ELSE
        ALTER ROLE gasflow_owner WITH LOGIN PASSWORD '$ownerPw';
    END IF;

    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'gasflow_app') THEN
        CREATE ROLE gasflow_app LOGIN PASSWORD '$appPw';
    ELSE
        ALTER ROLE gasflow_app WITH LOGIN PASSWORD '$appPw';
    END IF;
END
`$\$;

ALTER ROLE gasflow_owner NOSUPERUSER NOCREATEROLE NOCREATEDB NOBYPASSRLS NOREPLICATION;
ALTER ROLE gasflow_app NOSUPERUSER NOCREATEROLE NOCREATEDB NOBYPASSRLS NOREPLICATION;

ALTER DATABASE gasflow OWNER TO gasflow_owner;

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON DATABASE gasflow FROM PUBLIC;

GRANT CONNECT ON DATABASE gasflow TO gasflow_app;
GRANT USAGE ON SCHEMA public TO gasflow_app;

ALTER SCHEMA public OWNER TO gasflow_owner;
GRANT CREATE ON SCHEMA public TO gasflow_owner;

ALTER DEFAULT PRIVILEGES FOR ROLE gasflow_owner IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO gasflow_app;

ALTER DEFAULT PRIVILEGES FOR ROLE gasflow_owner IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO gasflow_app;

DO `$\$
BEGIN
  RAISE NOTICE 'GASFlow bootstrap complete: roles gasflow_owner, gasflow_app; db owned by gasflow_owner; app restricted.';
END
`$\$;
"@

$tempSqlPath = Join-Path $PWD "temp_setup.sql"
$sqlScript | Set-Content -Path $tempSqlPath -Encoding UTF8

& psql -U postgres -d gasflow -f "$tempSqlPath"

Remove-Item $tempSqlPath -Force
$env:PGPASSWORD = $null

Write-Host ""
Write-Host "===================================================" -ForegroundColor Green
Write-Host "SUCCESS! Local Database Ready." -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green
Write-Host "Ab tum Beekeeper Studio se connect kar sakte ho:"
Write-Host " - User:     gasflow_owner" -ForegroundColor DarkGray
Write-Host " - Password: .env se GASFLOW_OWNER_PASSWORD" -ForegroundColor DarkGray
Write-Host " - Database: gasflow" -ForegroundColor DarkGray
Write-Host "---------------------------------------------------"
Read-Host "Enter dabakar band karein..."
'@
[System.IO.File]::WriteAllText("$PWD\setup-local-db.ps1", $scriptContent, [System.Text.UTF8Encoding]::new($false))
Write-Host "File created: setup-local-db.ps1" -ForegroundColor Green