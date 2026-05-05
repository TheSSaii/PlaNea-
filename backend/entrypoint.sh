#!/bin/sh
set -e

echo "⏳ Running database migrations..."
npx prisma migrate deploy

echo "🚀 Starting application..."
if [ "$NODE_ENV" = "production" ]; then
  exec node dist/main
else
  exec npm run start:dev
fi