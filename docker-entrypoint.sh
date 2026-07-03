#!/bin/sh
set -e
echo "[videowall] applying database schema..."
npx prisma db push --schema=./prisma/schema.prisma --skip-generate --accept-data-loss || true
exec "$@"
