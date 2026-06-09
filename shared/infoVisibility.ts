import type { Activity } from './types'
import { getInfoTimePhase } from './infoTiming'

const INFO_DEFAULT_DAYS = 7

export function getPostType(activity: Partial<Activity>): 'activity' | 'info' {
  return activity.postType === 'info' ? 'info' : 'activity'
}

export function isInfoPost(activity: Partial<Activity>): boolean {
  return getPostType(activity) === 'info'
}

export function isProposalPost(activity: Partial<Activity>): boolean {
  return activity.status === 'proposed' && !isInfoPost(activity)
}

export function isInfoVisible(info: Activity, now: Date = new Date()): boolean {
  if (getPostType(info) !== 'info') return false
  if (getInfoTimePhase(info, now) === 'expired') return false
  if (info.infoDeadline) {
    const deadline = new Date(info.infoDeadline)
    if (!Number.isNaN(deadline.getTime())) {
      return deadline.getTime() > now.getTime()
    }
  }
  const created = new Date(info.createdAt)
  if (Number.isNaN(created.getTime())) return true
  const expires = created.getTime() + INFO_DEFAULT_DAYS * 86400000
  return expires > now.getTime()
}

export function sortInfosForHome<T extends Activity>(infos: T[], now: Date = new Date()): T[] {
  return [...infos]
    .filter((i) => isInfoVisible(i, now))
    .sort((a, b) => {
      const aKey = a.infoStartTime ?? a.infoDeadline ?? a.createdAt
      const bKey = b.infoStartTime ?? b.infoDeadline ?? b.createdAt
      return new Date(aKey).getTime() - new Date(bKey).getTime()
    })
    .slice(0, 3)
}
