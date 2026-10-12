#!/bin/sh
set -e

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Seeding database..."
npm run db:seed || echo "Seed skipped (may already exist)"

echo "Starting API..."
exec node dist/main.js
