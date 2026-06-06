import Link from 'next/link'
import type { ActivityWithCount } from '../../shared/types'
import { formatEventDate } from '../lib/user'

interface Props {
  activity: ActivityWithCount
}

export function PastActivityCard({ activity }: Props) {
  const recapPreview = activity.recap
    ? activity.recap.length > 60
      ? `${activity.recap.slice(0, 60)}…`
      : activity.recap
    : ''

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100">
      <h3 className="font-medium text-sm mb-1">{activity.title}</h3>
      <p className="text-xs text-gray-500 mb-2">
        {formatEventDate(activity.date)} · {activity.registeredCount}人参与
      </p>
      {recapPreview && (
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">「{recapPreview}」</p>
      )}
      <Link href={`/event/${activity.id}`} className="text-sm text-green-600 hover:underline">
        查看详情
      </Link>
    </div>
  )
}
