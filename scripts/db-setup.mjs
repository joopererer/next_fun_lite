/**
 * Apply schema.sql then seed sample data.
 *
 * Schema: requires SUPABASE_DB_URL (Postgres connection string from Supabase Dashboard)
 * Seed:   uses NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage: npm run db:setup
 */
import { config } from 'dotenv'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

config({ path: join(root, '.env.local') })
config({ path: join(root, '.env') })

async function runSchema() {
  const dbUrl = process.env.SUPABASE_DB_URL
  if (!dbUrl) {
    console.log('⚠ SUPABASE_DB_URL not set — skipping schema SQL.')
    console.log('  Add it from Supabase → Settings → Database → Connection string (URI)')
    console.log('  Or paste supabase/schema.sql into the SQL Editor manually.\n')
    return false
  }

  let pg
  try {
    pg = await import('pg')
  } catch {
    console.log('Installing pg for schema migration...')
    spawnSync('npm', ['install', '--save-dev', 'pg'], { cwd: root, stdio: 'inherit', shell: true })
    pg = await import('pg')
  }

  const schema = readFileSync(join(root, 'supabase', 'schema.sql'), 'utf8')
  const client = new pg.default.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } })
  await client.connect()
  try {
    await client.query(schema)
    console.log('✓ Schema applied via SUPABASE_DB_URL')
    return true
  } finally {
    await client.end()
  }
}

async function main() {
  console.log('Next Fun Lite — database setup\n')
  await runSchema()

  const seed = spawnSync('node', [join(__dirname, 'seed-supabase.mjs')], {
    cwd: root,
    stdio: 'inherit',
    shell: true,
  })
  process.exit(seed.status ?? 1)
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
