import type { Activity } from './types'

export type InfoTimePhase = 'not_started' | 'active_with_deadline' | 'active_open' | 'expired'

function parseTime(value: string | undefined): Date | null {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

export function getInfoTimePhase(
  info: Pick<Activity, 'infoStartTime' | 'infoDeadline'>,
  now: Date = new Date(),
): InfoTimePhase {
  const startTime = parseTime(info.infoStartTime)
  const deadline = parseTime(info.infoDeadline)
  const nowMs = now.getTime()

  if (deadline && nowMs > deadline.getTime()) {
    return 'expired'
  }
  if (startTime && nowMs < startTime.getTime()) {
    return 'not_started'
  }
  if (deadline && nowMs < deadline.getTime()) {
    return 'active_with_deadline'
  }
  return 'active_open'
}

export function formatInfoCountdown(
  target: Date,
  now: Date = new Date(),
): { text: string; urgent: boolean } {
  const diffMs = Math.max(0, target.getTime() - now.getTime())
  const totalMinutes = Math.floor(diffMs / 60000)

  if (totalMinutes <= 60) {
    const minutes = Math.max(1, totalMinutes || (diffMs > 0 ? 1 : 0))
    return { text: `${minutes}分钟`, urgent: true }
  }

  const totalHours = Math.floor(totalMinutes / 60)
  if (totalHours < 24) {
    const hours = totalHours
    const minutes = totalMinutes % 60
    return { text: minutes > 0 ? `${hours}小时${minutes}分钟` : `${hours}小时`, urgent: false }
  }

  const days = Math.floor(totalHours / 24)
  const hours = totalHours % 24
  return { text: hours > 0 ? `${days}天${hours}小时` : `${days}天`, urgent: false }
}

export function getInfoTimeStatusLabel(
  phase: InfoTimePhase,
  info: Pick<Activity, 'infoStartTime' | 'infoDeadline'>,
  now: Date = new Date(),
): string | null {
  const startTime = parseTime(info.infoStartTime)
  const deadline = parseTime(info.infoDeadline)

  if (phase === 'not_started' && startTime) {
    const { text } = formatInfoCountdown(startTime, now)
    return `⏰ 还有 ${text} 开始`
  }
  if (phase === 'active_with_deadline' && deadline) {
    const { text } = formatInfoCountdown(deadline, now)
    return `🔥 进行中 · 还有 ${text}截止`
  }
  return null
}

export function isInfoCountdownUrgent(
  phase: InfoTimePhase,
  info: Pick<Activity, 'infoStartTime' | 'infoDeadline'>,
  now: Date = new Date(),
): boolean {
  const target =
    phase === 'not_started'
      ? parseTime(info.infoStartTime)
      : phase === 'active_with_deadline'
        ? parseTime(info.infoDeadline)
        : null
  if (!target) return false
  return formatInfoCountdown(target, now).urgent
}

export function isInfoActionEnabled(
  info: Pick<Activity, 'infoStartTime' | 'infoDeadline'>,
  now: Date = new Date(),
): boolean {
  return getInfoTimePhase(info, now) !== 'not_started'
}
