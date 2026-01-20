/*
  Deprecated standalone blog seed script.

  Blog seeding (including Cloudinary cover selection and BlogImage audit records)
  is now unified in `prisma/seed.ts` which should be invoked via:

    npx prisma db seed
    or: npm run prisma:seed

  This file is intentionally reduced to a warning so teams don’t accidentally
  run out‑of‑date logic. If custom one‑off blog seeding is needed, implement it
  near the existing `upsertBlogs()` function in `seed.ts`.
*/

console.warn('[seed-blogs.ts] Deprecated: use prisma/seed.ts (npx prisma db seed) — no action performed.');
