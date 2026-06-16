'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { ActivityWithCount, Registration } from '../../shared/types'
import { getCancelReasonLabel, isEndedCancelled } from '../lib/activityStatus'
import { getCategoryEmoji, getCategoryLabel } from '../lib/categories'
import { formatEventDate } from '../lib/user'
import { api, getCancelUrl } from '../lib/api'
import { ModalSheet } from './ui/ModalSheet'
import { useT, useLang } from '../i18n/LanguageContext'

interface Props {
  activity: ActivityWithCount
  registration?: Registration | null
  onCancel?: () => void
}

export function MyRegistrationCard({ activity, registration, onCancel }: Props) {
  const t = useT()
  const { lang } = useLang()
  const [showConfirm, setShowConfirm] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const canCancel =
    registration &&
    !registration.cancelledAt &&
    activity.status === 'recruiting'

  const isGuestRegistration = Boolean(registration?.cancelToken && registration.id.startsWith('guest-'))

  const handleCancel = async () => {
    if (!registration || cancelling || isGuestRegistration) return
    setCancelling(true)
    try {
      await api.cancelRegistrationById(registration.id)
      setShowConfirm(false)
      onCancel?.()
    } catch (err) {
      alert(err instanceof Error ? err.message : t.error)
    } finally {
      setCancelling(false)
    }
  }

  if (isEndedCancelled(activity.status)) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-red-200 border-l-4 border-l-red-500">
        <p className="text-sm text-red-600 font-medium mb-2">{t.activityCancelled}</p>
        <h3 className="font-semibold text-base mb-2">{activity.title}</h3>
        <p className="text-sm text-gray-600 mb-1">
          {t.cancelReason(getCancelReasonLabel(activity.cancelReason))}
        </p>
        {activity.cancelNote && (
          <p className="text-sm text-gray-500 mb-2 whitespace-pre-wrap">{activity.cancelNote}</p>
        )}
        {activity.organizerWechat && (
          <p className="text-xs text-gray-500 mb-3">
            {t.contactOrganizer(activity.organizerWechat)}
          </p>
        )}
        <Link href={`/event/${activity.id}`} className="text-sm text-green-600 hover:underline">
          {t.viewDetails}
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full inline-block mb-2">
          {getCategoryEmoji(activity.category)} {getCategoryLabel(activity.category)}
        </span>
        <h3 className="font-semibold text-base mb-2">{activity.title}</h3>
        <p className="text-sm text-gray-500 mb-1">📅 {formatEventDate(activity.date, lang)}</p>
        <p className="text-sm text-gray-500 mb-1">📍 {activity.location || t.locationTbd}</p>
        <p className="text-sm text-gray-500 mb-2">👤 {activity.organizerName} {t.launchedBy}</p>
        {registration && (
          <p className="text-sm text-green-700 mb-3">{t.yourRegistration(registration.participantCount)}</p>
        )}
        <div className="flex items-center justify-between">
          <Link href={`/event/${activity.id}`} className="text-sm text-green-600 hover:underline">
            {t.viewDetails}
          </Link>
          {canCancel && (
            isGuestRegistration && registration.cancelToken ? (
              <Link
                href={getCancelUrl(registration.cancelToken)}
                className="text-xs text-gray-400 hover:text-red-500"
              >
                {t.cancelRegistrationLink}
              </Link>
            ) : (
              <button
                type="button"
                className="text-xs text-gray-400 hover:text-red-500"
                onClick={() => setShowConfirm(true)}
              >
                {t.cancelRegistrationLink}
              </button>
            )
          )}
        </div>
      </div>

      {showConfirm && (
        <ModalSheet
          open={showConfirm}
          onClose={() => setShowConfirm(false)}
          title={t.cancelPageTitle}
          footer={
            <div className="flex gap-2 sm:gap-3">
              <button type="button" className="btn-primary flex-1" onClick={handleCancel} disabled={cancelling}>
                {cancelling ? t.processing : t.cancelConfirmButton}
              </button>
              <button type="button" className="btn-secondary flex-1" onClick={() => setShowConfirm(false)}>
                {t.back}
              </button>
            </div>
          }
        >
          <p className="text-xs sm:text-sm text-gray-500">
            {t.cancelConfirmQuestion}
          </p>
        </ModalSheet>
      )}
    </>
  )
}
