Backend Render deployment notes

- Build command:
  npm ci && npx prisma generate && npx prisma migrate deploy && npx tsc -p tsconfig.build.json

- Start command:
  npx prisma migrate deploy && npx prisma db seed && node dist/main.js

- Required environment variables (Render dashboard -> Environment):
  - DATABASE_URL : postgres connection string provided by Render Postgres service
  - NODE_ENV=production
  - CORS_ORIGINS : list of allowed frontend origins, e.g. https://your-frontend.onrender.com
  - Any other secrets used by your app (CLOUDINARY_URL, STRIPE_SECRET, etc.)

- Notes:
  - Ensure `DATABASE_URL` is set before first deploy so `prisma migrate deploy` can run.
  - If seed fails in CI, run `npx prisma db seed` manually from the shell connected to the Render instance.
  - Logs: check Render build and service logs for `prisma generate` / `migrate deploy` output.
