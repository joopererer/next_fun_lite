'use client'

import type { ActivityWithCount } from '../../shared/types'
import { BADGE_LABELS, getActivityBadge, type ActivityBadgeKind } from '../lib/activityPhase'

const BADGE_STYLES: Record<ActivityBadgeKind, string> = {
  in_progress: 'bg-blue-50 text-blue-700',
  registration_closed: 'bg-gray-100 text-gray-500',
  full: 'bg-gray-100 text-gray-500',
  proposal_expired: 'bg-amber-50 text-amber-700',
}

interface Props {
  activity: ActivityWithCount
  className?: string
}

export function ActivityBadge({ activity, className = '' }: Props) {
  const kind = getActivityBadge(activity)
  if (!kind) return null
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${BADGE_STYLES[kind]} ${className}`}>
      {BADGE_LABELS[kind]}
    </span>
  )
}
