#!/usr/bin/env bash
# Runs once from /docker-entrypoint-initdb.d when the data volume is empty.
# Creates the application role (no superuser) and hands it the app database.
# CREATEDB is needed by the weekly restore check (<db>_restore_check scratch database).
set -euo pipefail

psql -v ON_ERROR_STOP=1 \
  --username "$POSTGRES_USER" \
  --dbname "$POSTGRES_DB" \
  -v app_user="$APP_DB_USER" \
  -v app_password="$APP_DB_PASSWORD" \
  -v app_db="$POSTGRES_DB" <<'SQL'
CREATE ROLE :"app_user" LOGIN PASSWORD :'app_password' CREATEDB NOSUPERUSER NOCREATEROLE;
ALTER DATABASE :"app_db" OWNER TO :"app_user";
ALTER SCHEMA public OWNER TO :"app_user";
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
SQL
