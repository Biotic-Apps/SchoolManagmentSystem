#!/bin/sh

echo "=== eSchool API entrypoint ==="
echo "NODE_ENV=$NODE_ENV"
echo "JOBS_DRIVER=$JOBS_DRIVER"
echo "CACHE_DRIVER=$CACHE_DRIVER"
echo "ALLOW_DEV_DRIVERS=$ALLOW_DEV_DRIVERS"

echo "--- Running Prisma migrations ---"
if npx prisma migrate deploy; then
  echo "--- Migrations OK ---"
else
  echo "!!! Migration FAILED (exit $?) !!!"
  exit 1
fi

echo "--- Seeding database ---"
if npm run db:seed; then
  echo "--- Seed OK ---"
else
  echo "!!! Seed FAILED (exit $?) — continuing anyway !!!"
fi

echo "--- Starting API ---"
exec node dist/main.js
