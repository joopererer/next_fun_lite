-- One-shot bootstrap: paste into Supabase SQL Editor, then run `npm run db:seed`
-- (seed is idempotent via upsert; or use the INSERT blocks below directly)

\i schema.sql

-- Below: inline seed (alternative to npm run db:seed)

-- Activities, registrations, interests are inserted by scripts/seed-supabase.mjs
-- after schema exists. Run: npm run db:seed
