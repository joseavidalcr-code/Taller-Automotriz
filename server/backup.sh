#!/usr/bin/env sh
set -eu
: "${DATABASE_URL:?DATABASE_URL is required}"
mkdir -p backups
stamp=$(date +%Y%m%d-%H%M%S)
pg_dump "$DATABASE_URL" --format=custom --file="backups/taller-$stamp.dump"
echo "Backup created: backups/taller-$stamp.dump"
