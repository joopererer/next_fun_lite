import type { Activity } from '@/shared/types'
import { formatOrganizerContactLine, resolveOrganizerContact } from '@/src/lib/contact'

export interface CalendarEventProps {
  uid: string
  title: string
  startTime: Date
  endTime: Date
  description?: string
  url?: string
  alarmMinutesBefore?: number
  label?: string
}

export function buildInfoCalendarEvent(activity: Activity): CalendarEventProps | null {
  if (!activity.infoStartTime && !activity.infoDeadline) return null

  const startTime = activity.infoStartTime
    ? new Date(activity.infoStartTime)
    : new Date(new Date(activity.infoDeadline!).getTime() - 60 * 60 * 1000)

  const baseEnd = activity.infoStartTime
    ? new Date(activity.infoStartTime)
    : new Date(activity.infoDeadline!)

  const endTime = new Date(baseEnd.getTime() + 30 * 60 * 1000)

  return {
    uid: activity.id,
    title: `⏰ ${activity.infoStartTime ? '抢票提醒' : '截止提醒'}：${activity.title}`,
    startTime,
    endTime,
    description: activity.description,
    url: activity.infoActionUrl || activity.sourceUrl,
    alarmMinutesBefore: 15,
    label: '📅 提醒我',
  }
}

export function buildActivityCalendarEvent(activity: Activity): CalendarEventProps | null {
  if (!activity.date) return null

  const startTime = new Date(activity.date)
  const endTime = new Date(startTime.getTime() + 3 * 60 * 60 * 1000)

  const organizer = resolveOrganizerContact(activity)
  const contactLine = formatOrganizerContactLine(activity)

  const description = [
    activity.description,
    activity.meetingLocation
      ? `集合地点：${activity.meetingLocation}`
      : activity.location
        ? `地点：${activity.location}`
        : '',
    organizer.type !== 'private' && organizer.contact
      ? `发起人：${activity.organizerName}（${contactLine}）`
      : activity.organizerName
        ? `发起人：${activity.organizerName}`
        : '',
  ]
    .filter(Boolean)
    .join('\n')

  return {
    uid: `activity-${activity.id}`,
    title: activity.title,
    startTime,
    endTime,
    description,
    alarmMinutesBefore: 60,
    label: '📅 加入日历',
  }
}
