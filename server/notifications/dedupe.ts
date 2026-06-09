import type { EnvConfig, NotificationType } from '@/shared/types'
import { createStorageAdapter } from '@/server/storage'

export async function checkReminderSent(
  env: EnvConfig,
  activityId: string,
  userId: string,
  type: NotificationType,
): Promise<boolean> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const storage = createStorageAdapter(env)
  const count = await storage.countNotificationsSince(activityId, userId, type, since)
  return count > 0
}
