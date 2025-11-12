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
