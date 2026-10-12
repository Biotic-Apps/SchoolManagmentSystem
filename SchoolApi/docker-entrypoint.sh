#!/bin/sh

echo "=== eSchool API entrypoint ==="
echo "NODE_ENV=$NODE_ENV"
echo "JOBS_DRIVER=$JOBS_DRIVER"
echo "CACHE_DRIVER=$CACHE_DRIVER"
echo "ALLOW_DEV_DRIVERS=$ALLOW_DEV_DRIVERS"
echo "DATABASE_URL set: $(test -n "$DATABASE_URL" && echo yes || echo no)"

echo "--- Running Prisma migrations ---"
npx prisma migrate deploy 2>&1 || echo "!!! Migration failed but continuing !!!"

echo "--- Seeding database ---"
npm run db:seed 2>&1 || echo "!!! Seed failed but continuing !!!"

echo "--- Starting API ---"
exec node dist/main.js
