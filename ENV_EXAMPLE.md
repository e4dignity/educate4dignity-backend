Env example (documentation)

This file documents the environment variables required for deploying the backend (do NOT store secrets here).

- `DATABASE_URL` - Postgres connection string (Render provided). Example:
  `postgresql://USER:PASS@HOST:5432/DBNAME?schema=public`
- `NODE_ENV` - set to `production` in Render
- `CORS_ORIGINS` - comma-separated allowed frontend origins (e.g. `https://your-frontend.onrender.com`)
- `CLOUDINARY_URL` - Cloudinary config if used
- `STRIPE_SECRET` - Stripe secret key if used
- `SMTP_URL` - SMTP connection string for outgoing emails

How to use on Render

1. Create a PostgreSQL database in Render (Dashboard → New → PostgreSQL).
2. Copy the provided database URL into Render service `DATABASE_URL` env var.
3. Add `CORS_ORIGINS` with your frontend URL(s).
4. Deploy the web service with the build/start commands in `RENDER.md`.
