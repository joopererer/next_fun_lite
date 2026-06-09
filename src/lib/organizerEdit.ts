import type { Activity } from '../../shared/types'
import { isTerminalStatus } from '@/src/lib/activityStatus'
import { isInfoPost } from '@/src/lib/infoVisibility'

export function canOrganizerEditActivity(activity: Activity, userId: string | undefined | null): boolean {
  if (!userId || !activity.organizerId || activity.organizerId !== userId) return false
  if (isTerminalStatus(activity.status)) return false
  if (isInfoPost(activity)) return true
  if (activity.status === 'recruiting') return true
  if (activity.status === 'proposed') return true
  return false
}

export function getOrganizerEditHref(activity: Activity): string | null {
  if (isInfoPost(activity)) return null
  if (activity.status === 'recruiting') return `/recruit/edit/${activity.id}`
  if (activity.status === 'proposed') return `/propose/edit/${activity.id}`
  return null
}
