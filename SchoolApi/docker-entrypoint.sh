#!/bin/sh
echo "=== eSchool API entrypoint ==="

echo "--- Running Prisma migrations ---"
npx prisma migrate deploy 2>&1 || echo "MIGRATE FAILED (continuing)"

echo "--- Seeding database ---"
npm run db:seed 2>&1 || echo "SEED FAILED (continuing)"

echo "--- Starting API ---"
exec node --max-old-space-size=400 dist/main.js
