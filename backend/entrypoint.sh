#!/bin/sh
set -e

echo "⏳ Running Prisma migrate deploy..."
npx prisma migrate deploy

echo "✅ Migrations applied. Starting app..."
exec node dist/src/main
