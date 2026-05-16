#!/bin/sh
set -e

echo "Checking frontend dependencies..."
if [ ! -d node_modules ] || [ ! -x node_modules/.bin/vite ]; then
  echo "Installing frontend dependencies..."
  npm ci
fi

echo "Starting frontend dev server..."
exec npm run dev -- --host 0.0.0.0
