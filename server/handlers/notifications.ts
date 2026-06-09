import { auth } from '@clerk/nextjs/server'
import type { EnvConfig } from '@/shared/types'
import { createStorageAdapter } from '@/server/storage'
import { errorResponse, jsonResponse } from '../lib/utils'

export async function handleGetNotifications(request: Request, env: EnvConfig): Promise<Response> {
  const { userId } = await auth()
  if (!userId) return errorResponse('Unauthorized', 401)

  const url = new URL(request.url)
  const unreadOnly = url.searchParams.get('unread') === 'true'
  const limitParam = url.searchParams.get('limit')
  const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 3, 1), 50) : 50

  const storage = createStorageAdapter(env)
  const notifications = await storage.getNotifications(userId, { unreadOnly, limit })
  return jsonResponse({ notifications })
}

export async function handleGetUnreadCount(_request: Request, env: EnvConfig): Promise<Response> {
  const { userId } = await auth()
  if (!userId) return errorResponse('Unauthorized', 401)

  const storage = createStorageAdapter(env)
  const count = await storage.getUnreadCount(userId)
  return jsonResponse({ count })
}

export async function handleMarkNotificationRead(
  _request: Request,
  env: EnvConfig,
  notificationId: string,
): Promise<Response> {
  const { userId } = await auth()
  if (!userId) return errorResponse('Unauthorized', 401)

  const storage = createStorageAdapter(env)
  const updated = await storage.markAsReadForUser(userId, notificationId)
  if (!updated) return errorResponse('Not found', 404)

  return jsonResponse({ ok: true })
}

export async function handleMarkAllNotificationsRead(_request: Request, env: EnvConfig): Promise<Response> {
  const { userId } = await auth()
  if (!userId) return errorResponse('Unauthorized', 401)

  const storage = createStorageAdapter(env)
  await storage.markAllAsRead(userId)
  return jsonResponse({ ok: true })
}
