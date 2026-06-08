import { shouldAutoEndSuccess } from '../../shared/activityPhase'
import type { Activity } from '../../shared/types'
import type { StorageAdapter } from '../storage/types'

export async function autoEndExpiredRecruitments(storage: StorageAdapter): Promise<void> {
  const now = new Date()
  const activities = await storage.getActivities()
  const toEnd = activities.filter((a) => shouldAutoEndSuccess(a, now))
  await Promise.all(
    toEnd.map((a) =>
      storage.updateActivity(a.id, {
        status: 'ended_success',
        endedAt: now.toISOString(),
      }),
    ),
  )
}

export async function getActivityAfterLifecycle(
  storage: StorageAdapter,
  activity: Activity,
): Promise<Activity> {
  if (shouldAutoEndSuccess(activity)) {
    await storage.updateActivity(activity.id, {
      status: 'ended_success',
      endedAt: new Date().toISOString(),
    })
    const updated = await storage.getActivity(activity.id)
    return updated ?? { ...activity, status: 'ended_success' }
  }
  return activity
}
