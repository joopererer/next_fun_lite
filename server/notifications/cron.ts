import type { EnvConfig } from '@/shared/types'
import { formatEventDate } from '@/shared/formatDate'
import { sendEmail } from '@/lib/email'
import { createStorageAdapter } from '@/server/storage'
import { checkReminderSent } from './dedupe'
import { getSiteUrl } from './format'
import { getNotificationEmail } from './helpers'

export async function runReminderCron(env: EnvConfig): Promise<{ ok: true }> {
  const now = new Date()
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  // Vercel Hobby allows one cron run per day; use 24h windows so a daily job still catches upcoming items.
  await Promise.all([
    sendActivityReminders(env, now, in24h),
    sendInfoStartReminders(env, now, in24h),
    sendInfoDeadlineReminders(env, now, in24h),
  ])

  return { ok: true }
}

async function sendActivityReminders(env: EnvConfig, now: Date, in24h: Date): Promise<void> {
  const storage = createStorageAdapter(env)
  const activities = await storage.getRecruitingActivitiesInDateRange(now.toISOString(), in24h.toISOString())
  const siteUrl = getSiteUrl(env)

  for (const activity of activities) {
    const registrations = await storage.getActiveRegistrations(activity.id)
    for (const reg of registrations) {
      if (!reg.userId) continue

      const profile = await storage.getProfile(reg.userId)
      if (profile && !profile.notifyActivityReminder) continue

      const alreadySent = await checkReminderSent(env, activity.id, reg.userId, 'activity_reminder')
      if (alreadySent) continue

      const location = activity.meetingLocation || activity.location || ''
      const body = `「${activity.title}」${formatEventDate(activity.date)} ${location}`.trim()

      await storage.createNotification({
        userId: reg.userId,
        type: 'activity_reminder',
        title: '明天的活动提醒',
        body,
        actionUrl: `/event/${activity.id}`,
        activityId: activity.id,
      })

      const email = await getNotificationEmail(env, reg.userId)
      if (email) {
        await sendEmail(env, {
          to: email,
          subject: `【活动提醒】明天：${activity.title}`,
          template: 'activity-reminder',
          props: { activity, siteUrl },
        })
      }
    }
  }
}

async function sendInfoStartReminders(env: EnvConfig, now: Date, in1h: Date): Promise<void> {
  const storage = createStorageAdapter(env)
  const infos = await storage.getInfoActivitiesWithStartInRange(now.toISOString(), in1h.toISOString())
  const siteUrl = getSiteUrl(env)

  for (const info of infos) {
    await sendInfoRemindersForActivity(env, info, 'start', siteUrl)
  }
}

async function sendInfoDeadlineReminders(env: EnvConfig, now: Date, in3h: Date): Promise<void> {
  const storage = createStorageAdapter(env)
  const infos = await storage.getInfoActivitiesWithDeadlineInRange(now.toISOString(), in3h.toISOString())
  const siteUrl = getSiteUrl(env)

  for (const info of infos) {
    await sendInfoRemindersForActivity(env, info, 'deadline', siteUrl)
  }
}

async function sendInfoRemindersForActivity(
  env: EnvConfig,
  info: import('@/shared/types').Activity,
  reminderType: 'start' | 'deadline',
  siteUrl: string,
): Promise<void> {
  const storage = createStorageAdapter(env)
  const interests = await storage.getInfoInterests(info.id)

  for (const interest of interests) {
    if (interest.userId) {
      const profile = await storage.getProfile(interest.userId)
      if (profile && !profile.notifyInfoReminder) continue

      const alreadySent = await checkReminderSent(env, info.id, interest.userId, 'info_reminder')
      if (alreadySent) continue

      const body =
        reminderType === 'start'
          ? `「${info.title}」即将开始，请做好准备`
          : `「${info.title}」即将截止，请尽快行动`

      await storage.createNotification({
        userId: interest.userId,
        type: 'info_reminder',
        title: reminderType === 'start' ? '资讯行动即将开始' : '资讯行动即将截止',
        body,
        actionUrl: `/event/${info.id}`,
        activityId: info.id,
      })
    }

    const email =
      interest.email?.trim() ||
      (interest.userId ? await getNotificationEmail(env, interest.userId) : null)
    if (!email) continue

    // already deduped above for signed-in users

    await sendEmail(env, {
      to: email,
      subject:
        reminderType === 'start'
          ? `【即将开始】${info.title}`
          : `【即将截止】${info.title}`,
      template: 'info-reminder',
      props: { info, type: reminderType, siteUrl },
    })
  }
}
