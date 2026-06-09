import { auth } from '@clerk/nextjs/server'
import type { EnvConfig } from '@/shared/types'
import { createStorageAdapter } from '@/server/storage'
import { errorResponse, jsonResponse } from '../lib/utils'

export async function handleGetNotifications(_request: Request, env: EnvConfig): Promise<Response> {
  const { userId } = await auth()
  if (!userId) return errorResponse('Unauthorized', 401)

  const storage = createStorageAdapter(env)
  const notifications = await storage.getNotifications(userId)
  return jsonResponse(notifications)
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
  const notifications = await storage.getNotifications(userId, 200)
  const target = notifications.find((n) => n.id === notificationId)
  if (!target) return errorResponse('Not found', 404)

  await storage.markAsRead(notificationId)
  return jsonResponse({ ok: true })
}

export async function handleMarkAllNotificationsRead(_request: Request, env: EnvConfig): Promise<Response> {
  const { userId } = await auth()
  if (!userId) return errorResponse('Unauthorized', 401)

  const storage = createStorageAdapter(env)
  await storage.markAllAsRead(userId)
  return jsonResponse({ ok: true })
}
