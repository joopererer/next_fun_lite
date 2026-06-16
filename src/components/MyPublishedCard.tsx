'use client'

import Link from 'next/link'
import type { ActivityWithCount } from '@/shared/types'
import { getStatusLabel, isEndedCancelled, isEndedSuccess, isTerminalStatus } from '@/src/lib/activityStatus'
import { isInfoPost, isProposalPost } from '@/src/lib/infoVisibility'
import { getOrganizerEditLink } from '@/src/lib/organizerEdit'
import { formatEventDate } from '@/src/lib/user'
import { useT, useLang } from '@/src/i18n/LanguageContext'

interface Props {
  activity: ActivityWithCount
}

function useTypeLabel(activity: ActivityWithCount): string {
  const t = useT()
  if (isInfoPost(activity)) return t.typeInfo
  if (isProposalPost(activity)) return t.typeProposal
  if (activity.status === 'recruiting') return t.typeRecruiting
  if (isEndedSuccess(activity.status)) return t.typeEnded
  if (isEndedCancelled(activity.status)) return t.typeCancelled
  return getStatusLabel(activity.status)
}

export function MyPublishedCard({ activity }: Props) {
  const t = useT()
  const { lang } = useLang()
  const typeLabel = useTypeLabel(activity)
  const editHref = getOrganizerEditLink(activity)

  const subtitle = (() => {
    if (isInfoPost(activity)) {
      if (activity.infoStartTime) return formatEventDate(activity.infoStartTime, lang)
      if (activity.infoDeadline) return t.statusDeadline(formatEventDate(activity.infoDeadline, lang))
      return formatEventDate(activity.createdAt, lang)
    }
    if (activity.date) return formatEventDate(activity.date, lang)
    if (activity.location) return activity.location
    return formatEventDate(activity.createdAt, lang)
  })()

  const extra = (() => {
    if (activity.status === 'recruiting') {
      return t.registeredCount(activity.registeredCount ?? 0, activity.maxParticipants ?? null)
    }
    if (isProposalPost(activity) && (activity.interestedCount ?? 0) > 0) {
      return t.interestedCountSimple(activity.interestedCount ?? 0)
    }
    return null
  })()

  return (
    <article className="bg-white rounded-xl p-4 border border-gray-100">
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="text-xs text-gray-500 shrink-0">{typeLabel}</span>
        {isTerminalStatus(activity.status) && (
          <span className="text-xs text-gray-400">{t.cannotEdit}</span>
        )}
      </div>
      <h3 className="font-medium text-sm mb-1">{activity.title}</h3>
      <p className="text-xs text-gray-500 mb-2">{subtitle}</p>
      {extra && <p className="text-xs text-gray-600 mb-2">{extra}</p>}
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
        <Link href={`/event/${activity.id}`} className="text-green-600 hover:underline">
          {t.viewDetails}
        </Link>
        {editHref && (
          <Link href={editHref} className="text-green-600 hover:underline">
            {t.edit}
          </Link>
        )}
      </div>
    </article>
  )
}
