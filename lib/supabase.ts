import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { EnvConfig } from '@/shared/types'

let client: SupabaseClient | null = null

export function getSupabaseClient(env?: EnvConfig): SupabaseClient {
  if (client) return client
  const url = env?.NEXT_PUBLIC_SUPABASE_URL ?? env?.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    env?.SUPABASE_SERVICE_ROLE_KEY ??
    env?.SUPABASE_SERVICE_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) {
    throw new Error('Supabase URL and service role key are required')
  }
  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return client
}

export function resetSupabaseClient(): void {
  client = null
}
