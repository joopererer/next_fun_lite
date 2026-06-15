'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { ActivityWithCount } from '../../shared/types'
import { getCategoryEmoji } from '../lib/categories'
import { getCatLabel } from './CategoryFilter'
import { canRegister, getActivityBadge } from '../lib/activityPhase'
import { formatEventDate } from '../lib/user'
import { CapacityBar } from './CapacityBar'
import { RegistrationPreview } from './RegistrationPreview'
import { ActivityBadge } from './ActivityBadge'
import { RegistrationModal } from './RegistrationModal'
import { api } from '../lib/api'
import { getClerkDisplayName } from '../lib/displayName'
import { notifyActivitiesChanged } from '../lib/activityEvents'
import { saveGuestRegistration } from '../lib/guestRegistrations'
import { addRegistrationId } from '../lib/registrations'
import { useT } from '../i18n/LanguageContext'

interface Props {
  activity: ActivityWithCount
  registered?: boolean
  onRegistered?: (activityId: string) => void
}

export function ActivityCard({ activity, registered = false, onRegistered }: Props) {
  const { isSignedIn, isLoaded, user: clerkUser } = useUser()
  const t = useT()
  const [localRegistered, setLocalRegistered] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [participantCount, setParticipantCount] = useState(1)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [localRegisteredCount, setLocalRegisteredCount] = useState(activity.registeredCount)

  const isRegistered = registered || localRegistered
  const open = canRegister(activity)

  const buttonLabel = (() => {
    if (isRegistered) return t.alreadyRegistered
    if (!open) {
      const badge = getActivityBadge(activity)
      if (badge === 'full') return t.full
      return t.registrationClosed
    }
    return t.registerButton
  })()

  const [summary, setSummary] = useState<{ total: number; previews: Array<{ name: string; avatarUrl: string | null }> }>({
    total: 0,
    previews: [],
  })
  const [summaryLoading, setSummaryLoading] = useState(true)

  useEffect(() => {
    setLocalRegisteredCount(activity.registeredCount)
  }, [activity.id, activity.registeredCount])

  useEffect(() => {
    setSummaryLoading(true)
    api.getRegistrationSummary(activity.id)
      .then(setSummary)
      .catch(() => setSummary({ total: 0, previews: [] }))
      .finally(() => setSummaryLoading(false))
  }, [activity.id, localRegisteredCount])

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) {
      setDisplayName('')
      return
    }
    const clerkName = getClerkDisplayName(clerkUser)
    api.getProfile()
      .then((p) => setDisplayName(p?.nickname?.trim() || clerkName))
      .catch(() => setDisplayName(clerkName))
  }, [isLoaded, isSignedIn, clerkUser])

  const submitRegistration = async (data: {
    name?: string
    wechat?: string
    contactType?: 'wechat' | 'email' | 'other'
    contactValue?: string
    contactLabel?: string
  }) => {
    if (isRegistered || !open) return
    if (activity.maxParticipants != null && localRegisteredCount + participantCount > activity.maxParticipants) {
      alert(t.full)
      return
    }

    const previousCount = localRegisteredCount
    setLocalRegisteredCount((c) => c + participantCount)
    setLocalRegistered(true)
    setShowModal(false)
    setSubmitting(true)

    try {
      const res = await api.createRegistration({
        activityId: activity.id,
        name: data.name,
        wechat: data.wechat,
        contactType: data.contactType,
        contactValue: data.contactValue,
        contactLabel: data.contactLabel,
        participantCount,
        note: note.trim(),
      })
      if (res.cancelToken) {
        saveGuestRegistration({
          activityId: activity.id,
          cancelToken: res.cancelToken,
          name: data.name ?? displayName,
          participantCount,
          registeredAt: new Date().toISOString(),
        })
      } else {
        addRegistrationId(activity.id)
      }
      setLocalRegisteredCount(res.registeredCount)
      onRegistered?.(activity.id)
      notifyActivitiesChanged()
    } catch (err) {
      setLocalRegisteredCount(previousCount)
      setLocalRegistered(false)
      setShowModal(true)
      alert(err instanceof Error ? err.message : t.error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-gray-100 card-hover flex flex-col h-full">
        <Link href={`/event/${activity.id}`} className="block flex-1 group">
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full inline-block">
              {getCategoryEmoji(activity.category)} {getCatLabel(t, activity.category)}
            </span>
            <ActivityBadge activity={{ ...activity, registeredCount: localRegisteredCount }} />
          </div>
          <h3 className="font-semibold text-base mb-1 group-hover:text-green-700 transition-colors">
            {activity.title}
          </h3>
          <p className="text-sm text-gray-500 mb-2">
            {formatEventDate(activity.date)} · {activity.location || t.locationTbd}
          </p>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[2.75rem]">
            {activity.description || ' '}
          </p>
          <div className="mb-1">
            <CapacityBar current={localRegisteredCount} max={activity.maxParticipants} />
          </div>
          <RegistrationPreview
            total={summary.total}
            previews={summary.previews}
            loading={summaryLoading}
          />
          {activity.fee && (
            <p className="text-sm text-gray-600 mb-1">💰 {activity.fee}</p>
          )}
          <p className="text-sm text-gray-500 mb-2">👤 {activity.organizerName || 'Admin'} {t.launchedBy}</p>
          <p className="text-xs text-green-600 mb-3">{t.clickDetails}</p>
        </Link>
        {isRegistered ? (
          <div className="mt-auto text-center rounded-xl py-2.5 font-medium bg-gray-100 text-gray-500 border border-gray-200">
            {t.alreadyRegistered}
          </div>
        ) : (
          <button
            type="button"
            className={`mt-auto text-center rounded-xl py-2.5 font-medium transition-colors ${
              !open ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'btn-primary'
            }`}
            disabled={!open}
            onClick={() => setShowModal(true)}
          >
            {buttonLabel}
          </button>
        )}
      </div>

      <RegistrationModal
        open={showModal}
        onClose={() => setShowModal(false)}
        activityTitle={activity.title}
        participantCount={participantCount}
        note={note}
        onParticipantCountChange={setParticipantCount}
        onNoteChange={setNote}
        submitting={submitting}
        signedInDisplayName={
          isSignedIn ? (displayName || getClerkDisplayName(clerkUser) || undefined) : undefined
        }
        onSubmit={(data) => submitRegistration(data)}
      />
    </>
  )
}
