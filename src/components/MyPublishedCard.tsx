import Link from 'next/link'
import type { ActivityWithCount } from '@/shared/types'
import { getStatusLabel, isEndedCancelled, isEndedSuccess, isTerminalStatus } from '@/src/lib/activityStatus'
import { isInfoPost, isProposalPost } from '@/src/lib/infoVisibility'
import { getOrganizerEditLink } from '@/src/lib/organizerEdit'
import { formatEventDate } from '@/src/lib/user'

interface Props {
  activity: ActivityWithCount
}

function getTypeLabel(activity: ActivityWithCount): string {
  if (isInfoPost(activity)) return '📢 资讯'
  if (isProposalPost(activity)) return '💡 提议'
  if (activity.status === 'recruiting') return '🟢 招募'
  if (isEndedSuccess(activity.status)) return '✅ 已结束'
  if (isEndedCancelled(activity.status)) return '❌ 已取消'
  return getStatusLabel(activity.status)
}

function getSubtitle(activity: ActivityWithCount): string {
  if (isInfoPost(activity)) {
    if (activity.infoStartTime) return formatEventDate(activity.infoStartTime)
    if (activity.infoDeadline) return `截止 ${formatEventDate(activity.infoDeadline)}`
    return formatEventDate(activity.createdAt)
  }
  if (activity.date) return formatEventDate(activity.date)
  if (activity.location) return activity.location
  return formatEventDate(activity.createdAt)
}

function getExtraLine(activity: ActivityWithCount): string | null {
  if (activity.status === 'recruiting') {
    const count = activity.registeredCount ?? 0
    const cap = activity.maxParticipants
    return cap ? `${count}/${cap} 人已报名` : `${count} 人已报名`
  }
  if (isProposalPost(activity) && (activity.interestedCount ?? 0) > 0) {
    return `${activity.interestedCount} 人感兴趣`
  }
  return null
}

export function MyPublishedCard({ activity }: Props) {
  const editHref = getOrganizerEditLink(activity)
  const extra = getExtraLine(activity)

  return (
    <article className="bg-white rounded-xl p-4 border border-gray-100">
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="text-xs text-gray-500 shrink-0">{getTypeLabel(activity)}</span>
        {isTerminalStatus(activity.status) && (
          <span className="text-xs text-gray-400">不可编辑</span>
        )}
      </div>
      <h3 className="font-medium text-sm mb-1">{activity.title}</h3>
      <p className="text-xs text-gray-500 mb-2">{getSubtitle(activity)}</p>
      {extra && <p className="text-xs text-gray-600 mb-2">{extra}</p>}
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
        <Link href={`/event/${activity.id}`} className="text-green-600 hover:underline">
          查看详情
        </Link>
        {editHref && (
          <Link href={editHref} className="text-green-600 hover:underline">
            编辑
          </Link>
        )}
      </div>
    </article>
  )
}
