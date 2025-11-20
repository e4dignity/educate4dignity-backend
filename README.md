# Educate4Dignity Backend (NestJS)

Public API + admin endpoints for projects, blog, donations, transparency, and utilities.

## Endpoints (public excerpt)

- POST /api/public/newsletter/subscribe — add email to newsletter list (emails via SMTP)
- POST /api/public/chat — proxy chat to OpenAI (requires OPENAI_API_KEY)
- GET /api/projects — public projects list
- GET /api/projects/featured — featured projects for landing
- GET /api/blog — public blog list
- GET /api/blog/:slug — blog details
- POST /api/blog/:id/track-view — increments views metric
- POST /api/payments/create-checkout-session — Stripe Checkout session (if STRIPE configured)

## Env

Copy .env.example to .env and set at least:

- PORT=4000
- SITE_URL=http://localhost:3002  # Frontend URL
- DATABASE_URL=postgresql://...    # Prisma Postgres connection

SMTP (Gmail SMTP for newsletter/contact):
- SMTP_HOST=smtp.gmail.com
- SMTP_PORT=465
- SMTP_SECURE=true
- SMTP_USER=youraddress@gmail.com
- SMTP_PASS=your_app_password  # Google App Password (not your login)
- SENDER_EMAIL=youraddress@gmail.com
- NOTIFY_ADMIN_TO=alerts@yourorg.org,someone@example.com

Chatbot:
- OPENAI_API_KEY=sk-...

Stripe (optional for dev):
- STRIPE_SECRET_KEY=sk_test_...
- STRIPE_TEST_CHECKOUT_URL=https://buy.stripe.com/test_...
- ALLOWED_DONATION_AMOUNTS=10,25,50

## Run

```
npm install
npm run prisma:migrate
npm run prisma:seed   # optional: populate Projects & Blog for landing
npm run start:dev
```

It will bind to http://localhost:4000 and CORS is enabled.

## Local production (Docker Compose)

There are two ways to run the Dockerized backend locally:

1) From repo root (includes monitoring stack):

```
# From repo root
docker compose -f docker-compose.yml up -d --build postgres
docker compose -f docker-compose.yml up -d --build backend
```

2) From backend folder only (what you’ll use on CI/Render-like runs):

```
# From educate4dignity-backend
docker compose up -d --build postgres
docker compose up -d --build backend
```

In both cases:
- Port 5433 (host) -> 5432 (container) for Postgres
- Port 4000 (host) -> 4000 (container) for backend
- CORS is locked down by default to e4dignity.org; allow your dev UI by setting `CORS_ORIGINS` in `.env` (example includes `http://localhost:3000,http://localhost:3003`).

First run tips:
```
# Apply migrations (entrypoint does this automatically)
docker compose exec backend npx prisma migrate deploy

# Optional seed (idempotent): creates admin and blog/gallery content
docker compose exec backend npm run prisma:seed

# Health
curl -s http://localhost:4000/api/health | jq .
```

Seeding can be auto-triggered by setting `RUN_SEED_ON_START=1` in `.env`. Otherwise, run it manually as shown. The seed is designed to be safe to run multiple times.

## Unified seeding

Use ONLY `prisma/seed.ts` (via `npx prisma db seed` or `npm run prisma:seed`). The deprecated legacy script `prisma/seed-blogs.ts` now emits a warning and performs no action. Blog covers are assigned from preferred Cloudinary public_ids when available or rotate through existing gallery images.

Quick seed invocation examples:
```
npx prisma migrate deploy && npx prisma db seed
# or
npm run prisma:seed
```

## Validation checklist (manual)

```
# Public blog list
curl http://localhost:4000/api/blog

# Single blog detail
curl http://localhost:4000/api/blog/from-absenteeism-to-attendance

# Admin login (PowerShell)
Invoke-RestMethod -Method Post -Uri 'http://localhost:4000/api/auth/login' -ContentType 'application/json' -Body (@{ email='admin@e4d.test'; password='admin123' } | ConvertTo-Json)

# Use token on admin endpoint (PowerShell one-liner)
Invoke-RestMethod -Method Get -Uri 'http://localhost:4000/api/admin/blog' -Headers @{ Authorization = ('Bearer ' + (Invoke-RestMethod -Method Post -Uri 'http://localhost:4000/api/auth/login' -ContentType 'application/json' -Body (@{ email='admin@e4d.test'; password='admin123' } | ConvertTo-Json)).accessToken) }
```

Expected outcomes:
- /api/blog returns at least 3 posts with Cloudinary `coverImageUrl`.
- /api/blog/:slug returns `contentHtml` and `coverImageUrl`.
- Admin endpoint with Bearer token returns `total` and `items` array.

## Frontend integration hint

Point the frontend Vite app to backend API base:

Create `educate4dignity-frontend/.env.local`:
```
VITE_API_URL=http://localhost:4000/api
# Optional: leave this false for prod-like testing
VITE_DEV_AUTO_LOGIN=false
```

In frontend code, use `import.meta.env.VITE_API_BASE || 'http://localhost:4000/api'` for fetch calls. Rebuild:
```
cd educate4dignity-frontend
npm run build
```

During development (Vite dev server), if you need the convenience dev token endpoint, either:
- keep `VITE_DEV_AUTO_LOGIN=false` and sign in normally from the UI, or
- set `VITE_DEV_AUTO_LOGIN=true` AND in the backend `.env` set `DEV_ALLOW_TOKEN=1` so `/api/dev/token` is enabled even when `NODE_ENV=production`.

For an accurate prod-like test, prefer the first option and use the real `/api/auth/login`.

## Deploy on Render (backend-only repo)

You can deploy just this backend folder as a separate GitHub repository. Include the provided `render.yaml` at the repo root (already present in this folder) so Render picks up the configuration automatically.

Key points:
- Build Command: `npm ci && npx prisma generate && npx prisma migrate deploy && npx tsc -p tsconfig.build.json`
- Start Command: `npx prisma migrate deploy && npx prisma db seed && node dist/main.js`
	- This ensures the database is migrated and seeded on every start. The seed creates a super admin if missing:
		- Email: `admin@e4d.test`
		- Password: `admin123`
- Required env vars (set in Render Dashboard if not using render.yaml env injection):
	- `DATABASE_URL=postgresql://...`
	- `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` (strong random values)
	- `SITE_URL=https://your-frontend-domain`
	- Optional: `CLOUDINARY_*`, `SMTP_*`, `STRIPE_*`

After first deploy, try logging in from the frontend with the credentials above. If you changed DB, a restart will re-run `migrate deploy` and `db seed` so the admin exists.

### Windows quickstart (Docker + scripts)

If you use Docker Desktop for Postgres, the repo includes helper scripts that automate DB bring-up and checks:

```
# 1) Ensure Docker Desktop is running

# 2) Start Postgres and wait for health, then migrate & seed
powershell -NoProfile -ExecutionPolicy Bypass -File ../scripts/init-db.ps1

# 3) Start the backend
npm run start:dev

# Optional: probe health
powershell -NoProfile -ExecutionPolicy Bypass -File ../scripts/probe-health.ps1
```

To run a compiled build on a different port locally, create `.env.local` in this folder:

```
PORT=4001
```

Then start production build from this directory:

```
npm run build:tsc
npm run start:prod
```

### Database alternatives (if Docker Desktop is unavailable)

- Native PostgreSQL on Windows
	- Install (optional commands):
		- winget install -e --id PostgreSQL.PostgreSQL
		- Ensure the service is running and listening on 5432.
	- Create DB and user to match `.env` values (optional commands):
		- psql -U postgres -c "CREATE USER e4d WITH PASSWORD 'e4dpass';"
		- psql -U postgres -c "CREATE DATABASE e4d OWNER e4d;"
	- Verify `DATABASE_URL=postgresql://e4d:e4dpass@localhost:5432/e4d?schema=public` in `.env`.
	- Then run:
		- npm run prisma:migrate
		- npm run prisma:seed

- Hosted PostgreSQL (Neon, Supabase, etc.)
	- Create a database and obtain a connection string.
	- Set `DATABASE_URL` in `.env.local` to that URL.
	- Run migrations and seed as above.

Note on SQLite: Prisma's SQLite connector does not support several features used by this schema (enums, JSON fields, array columns). A SQLite dev mode would require non-trivial schema changes, so it is not provided.

### SMTP troubleshooting

If newsletter emails are not sent, check the backend logs at startup.
- You must put SMTP_* variables in educate4dignity-backend/.env (not only in .env.example)
- Log shows: `SMTP transporter initialised...` when OK.
- If you see `SMTP not fully configured...`, the service will only log emails without sending.
# educate4dignity-backend-
