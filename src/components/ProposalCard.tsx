'use client'

import { SignInButton, useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { ActivityWithCount } from '../../shared/types'
import { api } from '../lib/api'
import { formatEventDate } from '../lib/user'
import { getCategoryEmoji } from '../lib/categories'
import { getCatLabel } from './CategoryFilter'
import { getFeeLevelEmoji, getFeeLevelLabel } from '../lib/feeLevel'
import { formatRelativeTime, getSourceIcon } from '../lib/user'
import { getDeviceId } from '../utils/device'
import { isProposalExpired } from '../lib/activityPhase'
import { ActivityBadge } from './ActivityBadge'
import { ItineraryBlock } from './ItineraryBlock'
import { useT, useLang } from '../i18n/LanguageContext'

interface Props {
  activity: ActivityWithCount
  onInterestUpdate?: (activityId: string, interestedCount: number) => void
}

export function ProposalCard({ activity, onInterestUpdate }: Props) {
  const { isSignedIn, isLoaded, user: clerkUser } = useUser()
  const t = useT()
  const { lang } = useLang()
  const [interested, setInterested] = useState(false)
  const [count, setCount] = useState(activity.interestedCount ?? 0)
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [linkedRecruits, setLinkedRecruits] = useState<ActivityWithCount[]>([])
  const hot = count >= 5
  const expired = isProposalExpired(activity)

  useEffect(() => {
    if (!expanded || !activity.linkedRecruitIds?.length) {
      setLinkedRecruits([])
      return
    }
    api.getActivitiesByIds(activity.linkedRecruitIds)
      .then(setLinkedRecruits)
      .catch(() => setLinkedRecruits([]))
  }, [expanded, activity.id, activity.linkedRecruitIds])

  useEffect(() => {
    setCount(activity.interestedCount ?? 0)
  }, [activity.id, activity.interestedCount])

  useEffect(() => {
    if (!isLoaded) return
    const deviceId = getDeviceId()
    api.getInterests(activity.id)
      .then((interests) => {
        if (isSignedIn && clerkUser?.id) {
          setInterested(interests.some((i) => i.userId === clerkUser.id))
        } else if (deviceId) {
          setInterested(interests.some((i) => i.deviceId === deviceId))
        } else {
          setInterested(false)
        }
      })
      .catch(() => setInterested(false))
  }, [activity.id, isLoaded, isSignedIn, clerkUser?.id])

  const toggleInterest = async () => {
    if (loading || expired) return
    setLoading(true)
    try {
      const res = interested
        ? await api.deleteInterest({ activityId: activity.id })
        : await api.createInterest({ activityId: activity.id })
      const nextCount = typeof res.interestedCount === 'number' ? res.interestedCount : count
      setInterested(!interested)
      setCount(nextCount)
      onInterestUpdate?.(activity.id, nextCount)
    } catch (err) {
      alert(err instanceof Error ? err.message : t.error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 card-hover relative">
      {hot && (
        <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
          🔥
        </span>
      )}
      <Link href={`/event/${activity.id}`} className="block group">
        <div className="flex items-start gap-2 mb-1 flex-wrap">
          <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full shrink-0">
            {getCategoryEmoji(activity.category)} {getCatLabel(t, activity.category)}
          </span>
          <ActivityBadge activity={activity} />
        </div>
        <h3 className="font-semibold text-base mb-1 group-hover:text-green-700 transition-colors">
          {getSourceIcon(activity.sourceUrl)} {activity.title}
        </h3>
      </Link>
      <p className="text-xs text-gray-400 mb-2">
        {activity.organizerName || '—'} · {formatRelativeTime(activity.createdAt, lang)}
      </p>
      <p className={`text-sm text-gray-600 mb-2 ${expanded ? '' : 'line-clamp-2'}`}>
        {activity.description}
      </p>
      {expanded && (
        <div className="text-sm text-gray-600 space-y-1 mb-3 pl-1 border-l-2 border-green-100">
          {activity.location && <p>📍 {activity.location}</p>}
          {activity.feeLevel && (
            <p>
              {getFeeLevelEmoji(activity.feeLevel)} {getFeeLevelLabel(activity.feeLevel)}
              {activity.fee && activity.feeLevel === 'paid' ? ` · ${activity.fee}` : ''}
            </p>
          )}
          {activity.fee && activity.feeLevel !== 'paid' && <p>💰 {activity.fee}</p>}
          {activity.itinerary && (
            <div className="mt-2">
              <ItineraryBlock itinerary={activity.itinerary} />
            </div>
          )}
          {activity.notes && <p className="whitespace-pre-wrap text-gray-500">{activity.notes}</p>}
          {linkedRecruits.length > 0 && (
            <div className="mt-3 pt-3 border-t border-green-100">
              <p className="text-sm font-medium text-green-800 mb-2">🟢 {t.linkedRecruits}：</p>
              <ul className="space-y-2">
                {linkedRecruits.map((r) => (
                  <li key={r.id} className="text-sm">
                    · {r.title}{' '}
                    <span className="text-gray-500">
                      {formatEventDate(r.date, lang).replace(/ .*/, '')}{' '}
                      {r.registeredCount}{r.maxParticipants ? `/${r.maxParticipants}` : ''}
                    </span>{' '}
                    <Link href={`/event/${r.id}`} className="text-green-600 underline">
                      {t.registerButton} →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {activity.sourceUrl && (
            <a href={activity.sourceUrl} target="_blank" rel="noreferrer" className="text-green-600 underline block truncate">
              🔗 {t.fieldSourceUrl}
            </a>
          )}
          <Link href={`/event/${activity.id}`} className="text-green-600 text-sm inline-block mt-1">
            {t.viewDetails}
          </Link>
        </div>
      )}
      <button
        type="button"
        className="text-green-600 text-xs mb-3"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? `${t.showLess} ▴` : `${t.showMore} ▾`}
      </button>
      <p className="text-sm text-green-700 mb-3">💡 {t.interestedCount(count)}</p>
      <div className="flex gap-2">
        <button
          type="button"
          className={`flex-1 rounded-xl py-2 text-sm font-medium border transition-colors ${
            interested
              ? 'border-gray-300 bg-gray-100 text-gray-600'
              : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
          }`}
          onClick={toggleInterest}
          disabled={loading || expired}
        >
          {loading ? '...' : expired ? t.badge_proposal_expired : interested ? `❤️ ${t.notInterested}` : `❤️ ${t.interested}`}
        </button>
        {isSignedIn ? (
          <Link
            href={`/recruit/new?from=${activity.id}`}
            className="flex-1 btn-secondary text-sm text-center py-2"
          >
            {t.proposeToRecruit} →
          </Link>
        ) : (
          <SignInButton mode="modal">
            <button type="button" className="flex-1 btn-secondary text-sm py-2">
              {t.proposeToRecruit} →
            </button>
          </SignInButton>
        )}
      </div>
    </div>
  )
}
