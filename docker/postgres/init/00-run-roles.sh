#!/bin/sh
set -euo pipefail

: "${GASFLOW_APP_PASSWORD:?GASFLOW_APP_PASSWORD is required}"
: "${GASFLOW_OWNER_PASSWORD:?GASFLOW_OWNER_PASSWORD is required}"

psql -v ON_ERROR_STOP=1 \
     --username "$POSTGRES_USER" \
     --dbname   "$POSTGRES_DB" \
     -v app_pw="$GASFLOW_APP_PASSWORD" \
     -v owner_pw="$GASFLOW_OWNER_PASSWORD" \
     -v dbname="$POSTGRES_DB" \
     -f /docker-entrypoint-initdb.d/00-roles.sql.template