import type { Activity, ActivityStatus } from './types'

const PARIS_TZ = 'Europe/Paris'
const AUTO_END_GRACE_MS = 24 * 60 * 60 * 1000

export type RecruitingPhase =
  | 'registration_open'
  | 'registration_closed'
  | 'in_progress'
  | 'awaiting_wrap_up'

export function parseInstant(iso: string | null | undefined): Date | null {
  if (!iso) return null
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : d
}

export function getParisDateKey(date: Date): string {
  return date.toLocaleDateString('en-CA', { timeZone: PARIS_TZ })
}

/** Last moment (23:59:59.999) on the Paris calendar day of `date`. */
export function endOfParisDay(date: Date): Date {
  const dateStr = getParisDateKey(date)
  let low = date.getTime() - 12 * 3_600_000
  let high = date.getTime() + 36 * 3_600_000
  while (high - low > 500) {
    const mid = Math.floor((low + high) / 2)
    const d = new Date(mid)
    const localDate = getParisDateKey(d)
    const localTime = d.toLocaleTimeString('en-GB', { timeZone: PARIS_TZ, hour12: false })
    if (localDate < dateStr) {
      low = mid + 1
    } else if (localDate > dateStr) {
      high = mid - 1
    } else if (localTime < '23:59:59') {
      low = mid + 1
    } else {
      high = mid
    }
  }
  return new Date(high)
}

export function getActivityStart(activity: Pick<Activity, 'date'>): Date | null {
  return parseInstant(activity.date)
}

/** Activity end: explicit dateEnd, or end of start day in Paris when dateEnd is empty. */
export function getActivityEnd(activity: Pick<Activity, 'date' | 'dateEnd'>): Date | null {
  const explicit = parseInstant(activity.dateEnd)
  if (explicit) return explicit
  const start = getActivityStart(activity)
  if (!start) return null
  return endOfParisDay(start)
}

/** Registration closes at registrationDeadline, or at activity start if unset. */
export function getRegistrationDeadline(activity: Pick<Activity, 'date' | 'registrationDeadline'>): Date | null {
  const explicit = parseInstant(activity.registrationDeadline)
  if (explicit) return explicit
  return getActivityStart(activity)
}

export function isRegistrationOpen(
  activity: Pick<Activity, 'status' | 'date' | 'registrationDeadline' | 'maxParticipants'> & { registeredCount?: number },
  now: Date = new Date(),
): boolean {
  if (activity.status !== 'recruiting') return false
  const deadline = getRegistrationDeadline(activity)
  if (!deadline || now >= deadline) return false
  if (
    activity.maxParticipants != null &&
    activity.registeredCount != null &&
    activity.registeredCount >= activity.maxParticipants
  ) {
    return false
  }
  return true
}

export function isInProgress(
  activity: Pick<Activity, 'status' | 'date' | 'dateEnd'>,
  now: Date = new Date(),
): boolean {
  if (activity.status !== 'recruiting') return false
  const start = getActivityStart(activity)
  const end = getActivityEnd(activity)
  if (!start || !end) return false
  return now >= start && now <= end
}

export function shouldAutoEndSuccess(
  activity: Pick<Activity, 'status' | 'date' | 'dateEnd'>,
  now: Date = new Date(),
): boolean {
  if (activity.status !== 'recruiting') return false
  const end = getActivityEnd(activity)
  if (!end) return false
  return now.getTime() > end.getTime() + AUTO_END_GRACE_MS
}

export function getRecruitingPhase(
  activity: Pick<Activity, 'status' | 'date' | 'dateEnd' | 'registrationDeadline'>,
  now: Date = new Date(),
): RecruitingPhase | null {
  if (activity.status !== 'recruiting') return null
  const end = getActivityEnd(activity)
  if (end && now.getTime() > end.getTime() + AUTO_END_GRACE_MS) return 'awaiting_wrap_up'
  if (isInProgress(activity, now)) return 'in_progress'
  const deadline = getRegistrationDeadline(activity)
  if (deadline && now >= deadline) return 'registration_closed'
  return 'registration_open'
}

export function isProposalExpired(
  activity: Pick<Activity, 'status' | 'dateEnd'>,
  now: Date = new Date(),
): boolean {
  if (activity.status !== 'proposed') return false
  const end = parseInstant(activity.dateEnd)
  if (!end) return false
  return now > end
}

export type ActivityBadgeKind =
  | 'in_progress'
  | 'registration_closed'
  | 'full'
  | 'proposal_expired'

export function getActivityBadge(
  activity: Activity & { registeredCount?: number },
  now: Date = new Date(),
): ActivityBadgeKind | null {
  if (activity.status === 'proposed' && isProposalExpired(activity, now)) {
    return 'proposal_expired'
  }
  if (activity.status !== 'recruiting') return null
  if (isInProgress(activity, now)) return 'in_progress'
  if (!isRegistrationOpen(activity, now)) {
    if (
      activity.maxParticipants != null &&
      activity.registeredCount != null &&
      activity.registeredCount >= activity.maxParticipants
    ) {
      return 'full'
    }
    const deadline = getRegistrationDeadline(activity)
    if (deadline && now >= deadline) return 'registration_closed'
  }
  return null
}

export const BADGE_LABELS: Record<ActivityBadgeKind, string> = {
  in_progress: '正在进行',
  registration_closed: '报名已结束',
  full: '已满',
  proposal_expired: '信息已过期',
}

export function getRegistrationButtonLabel(
  activity: Activity & { registeredCount?: number },
  registered: boolean,
  now: Date = new Date(),
): string {
  if (registered) return '已报名'
  if (!isRegistrationOpen(activity, now)) {
    const badge = getActivityBadge(activity, now)
    if (badge === 'full') return '已满'
    return '报名已结束'
  }
  return '我要报名'
}

export function canRegister(
  activity: Activity & { registeredCount?: number },
  now: Date = new Date(),
): boolean {
  return activity.status === 'recruiting' && isRegistrationOpen(activity, now)
}

export function isRecruitingOnHome(
  activity: Pick<Activity, 'status' | 'date' | 'dateEnd'>,
  now: Date = new Date(),
): boolean {
  return activity.status === 'recruiting' && !shouldAutoEndSuccess(activity, now)
}
