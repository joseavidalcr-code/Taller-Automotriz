#!/usr/bin/env sh
set -eu
: "${DATABASE_URL:?DATABASE_URL is required}"
: "${1:?Indica el archivo .dump a restaurar}"
pg_restore --clean --if-exists --no-owner --dbname="$DATABASE_URL" "$1"
echo "Restore completed: $1"
