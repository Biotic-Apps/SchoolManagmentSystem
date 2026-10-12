#!/bin/sh
echo "=== Direct start (skip migrate/seed) ==="
exec node dist/main.js
