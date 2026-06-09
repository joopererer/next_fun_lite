import type { Activity, EnvConfig, NotificationType } from '@/shared/types'
import { formatEventDate } from '@/shared/formatDate'
import { sendEmail } from '@/lib/email'
import { createStorageAdapter } from '@/server/storage'
import { checkReminderSent } from './dedupe'
import {
  activityKeyFieldsChanged,
  buildChangeDescription,
  getActivityCancelBody,
  getSiteUrl,
} from './format'
import { getNotificationEmail } from './helpers'

async function createInAppNotification(
  env: EnvConfig,
  data: {
    userId: string
    type: NotificationType
    title: string
    body: string
    actionUrl?: string
    activityId?: string
  },
): Promise<void> {
  const storage = createStorageAdapter(env)
  await storage.createNotification(data)
}

function registrationFallbackEmail(reg: { contactType?: string; contactValue?: string }): string | undefined {
  if (reg.contactType === 'email' && reg.contactValue?.trim()) return reg.contactValue.trim()
  return undefined
}

export async function notifyActivityCancelled(env: EnvConfig, activityId: string): Promise<void> {
  const storage = createStorageAdapter(env)
  const activity = await storage.getActivity(activityId)
  if (!activity) return

  const registrations = await storage.getActiveRegistrations(activityId)
  const siteUrl = getSiteUrl(env)
  const cancelBody = getActivityCancelBody(activity)

  for (const reg of registrations) {
    if (reg.userId) {
      const profile = await storage.getProfile(reg.userId)
      if (profile && !profile.notifyRegistrationChange) continue

      await createInAppNotification(env, {
        userId: reg.userId,
        type: 'activity_cancelled',
        title: `「${activity.title}」已取消`,
        body: cancelBody,
        actionUrl: `/event/${activityId}`,
        activityId,
      })
    }

    const email = await getNotificationEmail(env, reg.userId, registrationFallbackEmail(reg))
    if (email) {
      await sendEmail(env, {
        to: email,
        subject: `【活动取消】${activity.title}`,
        template: 'activity-cancelled',
        props: { activity, siteUrl },
      })
    }
  }
}

export async function notifyActivityUpdated(
  env: EnvConfig,
  before: Activity,
  after: Activity,
): Promise<void> {
  const changedFields = activityKeyFieldsChanged(before, after)
  if (changedFields.length === 0) return

  const storage = createStorageAdapter(env)
  const registrations = await storage.getActiveRegistrations(after.id)
  const changeDesc = buildChangeDescription(changedFields, after)
  const siteUrl = getSiteUrl(env)

  for (const reg of registrations) {
    if (reg.userId) {
      const profile = await storage.getProfile(reg.userId)
      if (profile && !profile.notifyRegistrationChange) continue

      await createInAppNotification(env, {
        userId: reg.userId,
        type: 'activity_updated',
        title: `「${after.title}」信息有更新`,
        body: changeDesc,
        actionUrl: `/event/${after.id}`,
        activityId: after.id,
      })
    }

    const email = await getNotificationEmail(env, reg.userId, registrationFallbackEmail(reg))
    if (email) {
      await sendEmail(env, {
        to: email,
        subject: `【活动更新】${after.title}`,
        template: 'activity-updated',
        props: { activity: after, changeDesc, siteUrl },
      })
    }
  }
}

export async function notifyProposalRecruiting(
  env: EnvConfig,
  proposalId: string,
  recruitId: string,
): Promise<void> {
  const storage = createStorageAdapter(env)
  const recruit = await storage.getActivity(recruitId)
  if (!recruit) return

  const interests = await storage.getInterests(proposalId)
  const siteUrl = getSiteUrl(env)
  const datePart = recruit.date ? formatEventDate(recruit.date) : ''
  const body = `「${recruit.title}」${datePart} ${recruit.location || ''}`.trim()

  for (const interest of interests) {
    if (!interest.userId) continue

    const profile = await storage.getProfile(interest.userId)
    if (profile && !profile.notifyProposalRecruiting) continue

    await createInAppNotification(env, {
      userId: interest.userId,
      type: 'proposal_recruiting',
      title: '你感兴趣的活动开始招募了！',
      body,
      actionUrl: `/event/${recruitId}`,
      activityId: recruitId,
    })

    const email = await getNotificationEmail(env, interest.userId)
    if (email) {
      await sendEmail(env, {
        to: email,
        subject: `【开始招募】${recruit.title}`,
        template: 'proposal-recruiting',
        props: { recruit, siteUrl },
      })
    }
  }
}

export async function notifyNewRecruit(env: EnvConfig, activity: Activity): Promise<void> {
  const storage = createStorageAdapter(env)
  const profiles = await storage.listProfilesWithPreference('notifyNewRecruit')
  const siteUrl = getSiteUrl(env)
  const datePart = activity.date ? formatEventDate(activity.date) : ''
  const body = `「${activity.title}」${datePart} ${activity.location || ''}`.trim()

  for (const profile of profiles) {
    if (profile.id === activity.organizerId) continue

    await createInAppNotification(env, {
      userId: profile.id,
      type: 'new_recruit',
      title: '有新活动开始招募',
      body,
      actionUrl: `/event/${activity.id}`,
      activityId: activity.id,
    })

    const email = await getNotificationEmail(env, profile.id)
    if (email) {
      await sendEmail(env, {
        to: email,
        subject: `【新招募】${activity.title}`,
        template: 'proposal-recruiting',
        props: { recruit: activity, siteUrl },
      })
    }
  }
}

export async function dispatchActivityNotifications(
  env: EnvConfig,
  before: Activity,
  after: Activity,
): Promise<void> {
  if (before.status !== 'ended_cancelled' && after.status === 'ended_cancelled') {
    await notifyActivityCancelled(env, after.id)
    return
  }

  if (after.status === 'ended_cancelled') return

  const changedFields = activityKeyFieldsChanged(before, after)
  if (changedFields.length > 0) {
    await notifyActivityUpdated(env, before, after)
  }
}

export async function dispatchRecruitmentNotifications(
  env: EnvConfig,
  activity: Activity,
  sourceProposalId?: string,
): Promise<void> {
  if (sourceProposalId) {
    await notifyProposalRecruiting(env, sourceProposalId, activity.id)
  }
  await notifyNewRecruit(env, activity)
}
