import type { ActivityStatus, CancelReason } from './types'

export function normalizeActivityStatus(status: string): ActivityStatus {
  if (status === 'ended') return 'ended_success'
  if (
    status === 'proposed' ||
    status === 'recruiting' ||
    status === 'ended_success' ||
    status === 'ended_cancelled'
  ) {
    return status
  }
  return 'proposed'
}

export function isTerminalStatus(status: ActivityStatus): boolean {
  return status === 'ended_success' || status === 'ended_cancelled'
}

export function isEndedSuccess(status: ActivityStatus): boolean {
  return status === 'ended_success'
}

export function isEndedCancelled(status: ActivityStatus): boolean {
  return status === 'ended_cancelled'
}

export function isEndedColumnStatus(status: ActivityStatus): boolean {
  return isEndedSuccess(status) || isEndedCancelled(status)
}

export function getStatusLabel(status: ActivityStatus): string {
  switch (status) {
    case 'proposed':
      return '提议池'
    case 'recruiting':
      return '招募中'
    case 'ended_success':
      return '已结束'
    case 'ended_cancelled':
      return '已取消'
    default:
      return status
  }
}

export function getCancelReasonLabel(reason: CancelReason | undefined): string {
  switch (reason) {
    case 'weather':
      return '天气原因'
    case 'insufficient_participants':
      return '报名人数不足'
    case 'venue':
      return '场地/时间问题'
    case 'other':
      return '其他'
    default:
      return '未说明'
  }
}

export type StatusTransition =
  | 'recruiting'
  | 'ended_success'
  | 'ended_cancelled'

export function getAllowedTransitions(current: ActivityStatus): StatusTransition[] {
  switch (current) {
    case 'proposed':
      return ['recruiting', 'ended_cancelled']
    case 'recruiting':
      return ['ended_success', 'ended_cancelled']
    default:
      return []
  }
}

export function getTransitionLabel(target: StatusTransition): string {
  switch (target) {
    case 'recruiting':
      return '转为招募'
    case 'ended_success':
      return '结束活动'
    case 'ended_cancelled':
      return '取消活动'
  }
}

export function normalizeActivity(activity: { status: string } & Record<string, unknown>): void {
  activity.status = normalizeActivityStatus(activity.status)
}
