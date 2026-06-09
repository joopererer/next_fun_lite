import type { Activity } from '@/shared/types'
import { getCancelReasonLabel } from '@/shared/activityStatus'
import { formatEventDate } from '@/shared/formatDate'

const FIELD_LABELS: Record<string, string> = {
  date: '活动时间',
  location: '活动地点',
  meetingLocation: '集合地点',
  meetingTime: '集合时间',
}

export function buildChangeDescription(changedFields: string[], activity: Activity): string {
  const parts: string[] = []
  for (const field of changedFields) {
    switch (field) {
      case 'date':
        parts.push(`时间已更新为 ${formatEventDate(activity.date)}`)
        break
      case 'location':
        parts.push(`地点已更新为 ${activity.location}`)
        break
      case 'meetingLocation':
        parts.push(`集合地点已更新为 ${activity.meetingLocation || '—'}`)
        break
      case 'meetingTime':
        parts.push(`集合时间已更新为 ${activity.meetingTime || '—'}`)
        break
      default:
        if (FIELD_LABELS[field]) parts.push(`${FIELD_LABELS[field]}已更新`)
    }
  }
  return parts.join('；') || '活动信息有更新'
}

export function getActivityCancelBody(activity: Activity): string {
  if (activity.cancelNote?.trim()) return `原因：${activity.cancelNote.trim()}`
  if (activity.cancelReason) return `原因：${getCancelReasonLabel(activity.cancelReason)}`
  return '本次活动已取消'
}

export function getSiteUrl(env?: { SITE_URL?: string }): string {
  return env?.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? 'http://localhost:3000'
}

export function activityKeyFieldsChanged(before: Activity, after: Activity): string[] {
  const keys = ['date', 'location', 'meetingLocation', 'meetingTime'] as const
  return keys.filter((key) => before[key] !== after[key])
}
