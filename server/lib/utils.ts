import type { EnvConfig } from '../../shared/types'
import type { StorageAdapter } from '../storage/types'

export function getEnvConfig(env?: EnvConfig): EnvConfig {
  if (env) return env
  return {
    STORAGE_BACKEND: process.env.STORAGE_BACKEND,
    GOOGLE_SHEETS_ID: process.env.GOOGLE_SHEETS_ID,
    GOOGLE_SERVICE_ACCOUNT_JSON: process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
    TENCENT_DOCS_APP_ID: process.env.TENCENT_DOCS_APP_ID,
    TENCENT_DOCS_APP_SECRET: process.env.TENCENT_DOCS_APP_SECRET,
    CLAUDE_API_KEY: process.env.CLAUDE_API_KEY,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    SITE_URL: process.env.SITE_URL,
    PARSE_MODE: process.env.PARSE_MODE,
  }
}

export function checkAdminAuth(request: Request, env: EnvConfig): boolean {
  const password = request.headers.get('X-Admin-Password')
  const adminPassword = env.ADMIN_PASSWORD
  if (!adminPassword) return false
  return password === adminPassword
}

export async function getRegisteredCount(storage: StorageAdapter, activityId: string): Promise<number> {
  const registrations = await storage.getRegistrations(activityId)
  return registrations.reduce((sum, r) => sum + r.participantCount, 0)
}

export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status)
}

export async function parseBody<T>(request: Request): Promise<T> {
  return request.json() as Promise<T>
}
