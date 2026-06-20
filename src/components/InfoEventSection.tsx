'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AddToCalendarButton } from './AddToCalendarButton'
import type { Activity } from '../../shared/types'
import { DEFAULT_INFO_ACTION_LABEL } from '../../shared/infoDefaults'
import { buildInfoCalendarEvent } from '../lib/calendarEvents'
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

export function InfoEventSection({ activity }: Props) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  const phase = getInfoTimePhase(activity, now)
  const statusLabel = getInfoTimeStatusLabel(phase, activity, now)
  const urgent = isInfoCountdownUrgent(phase, activity, now)
  const actionEnabled = isInfoActionEnabled(activity, now)
  const actionLabel = activity.infoActionLabel || DEFAULT_INFO_ACTION_LABEL
  const calendarEvent = buildInfoCalendarEvent(activity)

  return (
    <>
      <span className="text-xs bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full inline-block mb-2">
        📢 资讯
      </span>
      <h1 className="text-2xl font-bold mb-2">{activity.title}</h1>
      <p className="text-sm text-gray-500 mb-4">{activity.organizerName}</p>
      {activity.description && (
        <p className="text-gray-700 whitespace-pre-wrap mb-4">{activity.description}</p>
      )}
      <div className="space-y-2 text-sm text-gray-600 mb-6">
        {activity.location && <p>📍 {activity.location}</p>}
        {activity.infoPrice && <p>💰 {activity.infoPrice}</p>}
        {statusLabel && (
          <p className={
            urgent ? 'text-red-600 font-medium'
              : phase === 'pre_open' ? 'text-orange-700 font-medium'
              : phase === 'active_with_deadline' ? 'text-amber-700'
              : ''
          }>
            {statusLabel}
          </p>
        )}
        {activity.infoStartTime && (phase === 'not_started' || phase === 'pre_open') && (
          <p className="text-gray-500">开始：{formatEventDate(activity.infoStartTime)}</p>
        )}
        {activity.infoDeadline && phase !== 'not_started' && phase !== 'pre_open' && !statusLabel && (
          <p>⏰ 截止：{formatEventDate(activity.infoDeadline)}</p>
        )}
        {activity.sourceUrl && (
          <a href={activity.sourceUrl} target="_blank" rel="noreferrer" className="text-green-600 underline block truncate">
            🔗 参考链接
          </a>
        )}
      </div>
      <div className="flex flex-col gap-3">
        {activity.infoActionUrl && (
          actionEnabled ? (
            <a
              href={activity.infoActionUrl}
              target="_blank"
              rel="noreferrer"
              className={`w-full text-center text-sm ${
                phase === 'active_with_deadline'
                  ? 'btn-primary ring-2 ring-amber-300/80'
                  : phase === 'pre_open'
                    ? 'btn-primary ring-2 ring-orange-300/80'
                    : 'btn-primary'
              }`}
            >
              {actionLabel} →
            </a>
          ) : (
            <span className="w-full text-center rounded-xl py-2.5 font-medium bg-gray-100 text-gray-400 cursor-not-allowed block">
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
            variant="button"
            showHint={false}
          />
        )}
        <Link href={`/recruit/new?from_info=${activity.id}`} className="btn-secondary w-full text-center">
          我抢到了，发起组团
        </Link>
        <Link href="/" className="text-sm text-center text-gray-500 hover:text-green-600">回到首页</Link>
      </div>
    </>
  )
}
