import type { Activity, ActivityWithCount } from '@/shared/types'
import { normalizeActivityStatus } from '@/shared/activityStatus'
import type { StorageAdapter } from '@/server/storage/types'
import { getRegisteredCount } from './utils'

export async function enrichActivity(
  storage: StorageAdapter,
  activity: Activity,
): Promise<ActivityWithCount> {
  const [registeredCount, interests] = await Promise.all([
    getRegisteredCount(storage, activity.id),
    storage.getInterests(activity.id),
  ])
  const interestedCount = interests.length
  return {
    ...activity,
    status: normalizeActivityStatus(activity.status),
    registeredCount,
    interestedCount,
  }
}
