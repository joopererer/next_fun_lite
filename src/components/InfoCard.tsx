'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AddToCalendarButton } from './AddToCalendarButton'
import type { Activity } from '../../shared/types'
import { DEFAULT_INFO_ACTION_LABEL } from '../../shared/infoDefaults'
import { buildInfoCalendarEvent } from '../lib/calendarEvents'
import { getCategoryEmoji, getCategoryLabel } from '../lib/categories'
import { formatEventDate } from '../lib/user'
import {
  getInfoTimePhase,
  getInfoTimeStatusLabel,
  isInfoActionEnabled,
  isInfoCountdownUrgent,
} from '../lib/infoTiming'

interface Props {
  activity: Activity
}

export function InfoCard({ activity }: Props) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  const phase = getInfoTimePhase(activity, now)
  const statusLabel = getInfoTimeStatusLabel(phase, activity, now)
  const urgent = isInfoCountdownUrgent(phase, activity, now)
  const actionEnabled = isInfoActionEnabled(activity, now)

  const preview = activity.description
    ? activity.description.length > 80
      ? `${activity.description.slice(0, 80)}…`
      : activity.description
    : ''

  const actionLabel = activity.infoActionLabel || DEFAULT_INFO_ACTION_LABEL
  const calendarEvent = buildInfoCalendarEvent(activity)

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
      {statusLabel && (
        <p
          className={`text-sm mb-3 ${
            urgent ? 'text-red-600 font-medium' : phase === 'active_with_deadline' ? 'text-amber-700' : 'text-gray-600'
          }`}
        >
          {statusLabel}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {activity.infoActionUrl && (
          actionEnabled ? (
            <a
              href={activity.infoActionUrl}
              target="_blank"
              rel="noreferrer"
              className={`text-sm ${
                phase === 'active_with_deadline'
                  ? 'btn-primary ring-2 ring-amber-300/80'
                  : 'btn-primary'
              }`}
            >
              {actionLabel} →
            </a>
          ) : (
            <span className="text-sm rounded-xl px-4 py-2.5 font-medium bg-gray-100 text-gray-400 cursor-not-allowed">
              {actionLabel}
            </span>
          )
        )}
        {calendarEvent && (
          <AddToCalendarButton
            uid={calendarEvent.uid}
            title={calendarEvent.title}
            startTime={calendarEvent.startTime}
            endTime={calendarEvent.endTime}
            description={calendarEvent.description}
            url={calendarEvent.url}
            alarmMinutesBefore={calendarEvent.alarmMinutesBefore}
            label={calendarEvent.label}
            showHint={false}
          />
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
