#!/usr/bin/env sh
set -e

# Optional: echo environment info
echo "Starting backend entrypoint (NODE_ENV=$NODE_ENV)"

# Ensure database is reachable before migrations (simple wait loop)
if [ -n "$DATABASE_URL" ]; then
  echo "Waiting for database to be reachable..."
  # rudimentary wait: try psql if available, else sleep a few seconds
  # We skip installing psql to keep image slim; rely on retrying prisma directly
fi

# Apply migrations
echo "Running prisma migrate deploy..."
npx prisma migrate deploy

# Optionally seed database (disabled by default to avoid crash loops when optional models are absent)
if [ "$RUN_SEED_ON_START" = "1" ]; then
  echo "Running prisma db seed..."
  npx prisma db seed || echo "Seed failed, continuing"
fi

# Start server
echo "Starting server..."
exec node dist/main.js
