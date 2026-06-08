'use client'

import Link from 'next/link'
import type { Activity } from '../../shared/types'
import { getCategoryEmoji, getCategoryLabel } from '../lib/categories'
import { formatEventDate } from '../lib/user'

interface Props {
  activity: Activity
}

export function InfoCard({ activity }: Props) {
  const preview = activity.description
    ? activity.description.length > 80
      ? `${activity.description.slice(0, 80)}…`
      : activity.description
    : ''

  return (
    <article className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs text-gray-500">
          {getCategoryEmoji(activity.category)} {getCategoryLabel(activity.category)}
        </span>
      </div>
      <h3 className="font-semibold text-lg mb-1">{activity.title}</h3>
      <p className="text-xs text-gray-500 mb-2">
        {activity.organizerName}
        {activity.createdAt && ` · ${formatEventDate(activity.createdAt)}`}
      </p>
      {preview && <p className="text-sm text-gray-600 mb-3">{preview}</p>}
      {activity.infoPrice && (
        <p className="text-sm text-gray-700 mb-2">💰 {activity.infoPrice}</p>
      )}
      {activity.infoDeadline && (
        <p className="text-sm text-amber-700 mb-3">
          ⏰ 截止：{formatEventDate(activity.infoDeadline)}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {activity.infoActionUrl && (
          <a
            href={activity.infoActionUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-primary text-sm"
          >
            {activity.infoActionLabel || '查看详情'} →
          </a>
        )}
        <Link
          href={`/recruit/new?from_info=${activity.id}`}
          className="btn-secondary text-sm"
        >
          我抢到了，发起组团
        </Link>
        <Link href={`/event/${activity.id}`} className="text-sm text-green-600 hover:underline self-center">
          详情
        </Link>
      </div>
    </article>
  )
}
