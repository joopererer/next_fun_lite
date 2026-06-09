import type { EnvConfig } from '../../shared/types'
import type { StorageAdapter } from '../storage/types'
import { getEnvConfig as loadEnvConfig } from '@/lib/env'

export function getEnvConfig(env?: EnvConfig): EnvConfig {
  return loadEnvConfig(env)
}

export function checkAdminAuth(request: Request, env: EnvConfig): boolean {
  const password = request.headers.get('X-Admin-Password')
  const adminPassword = env.ADMIN_PASSWORD
  if (!adminPassword) return false
  return password === adminPassword
}

export function requireAdminAuth(request: Request, env: EnvConfig): Response | null {
  if (checkAdminAuth(request, env)) return null
  if (!env.ADMIN_PASSWORD) {
    return errorResponse('服务端未配置 ADMIN_PASSWORD，请在 Vercel 环境变量中设置', 503)
  }
  return errorResponse('管理员密码错误', 401)
}

export async function getRegisteredCount(storage: StorageAdapter, activityId: string): Promise<number> {
  const registrations = await storage.getActiveRegistrations(activityId)
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
