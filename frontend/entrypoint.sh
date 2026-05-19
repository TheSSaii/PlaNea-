#!/bin/sh
set -e

echo "Checking frontend dependencies..."
if [ ! -d node_modules ] \
  || [ ! -x node_modules/.bin/vite ] \
  || [ ! -d node_modules/leaflet ] \
  || [ ! -d node_modules/leaflet-routing-machine ]; then
  echo "Installing frontend dependencies..."
  rm -rf node_modules/.vite 2>/dev/null || true
  npm ci
fi

echo "Starting frontend dev server..."
exec npm run dev -- --host 0.0.0.0
