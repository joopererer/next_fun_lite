'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import type { Activity, Registration } from '@/shared/types'
import { Header } from '@/src/components/layout/Header'
import { Footer } from '@/src/components/layout/Footer'
import { formatEventDate } from '@/src/lib/user'
import { removeGuestRegistration } from '@/src/lib/guestRegistrations'
import { notifyActivitiesChanged } from '@/src/lib/activityEvents'
import { useT } from '@/src/i18n/LanguageContext'

export function CancelRegistrationPage() {
  const { token } = useParams<{ token: string }>()
  const [loading, setLoading] = useState(true)
  const [registration, setRegistration] = useState<Registration | null>(null)
  const [activity, setActivity] = useState<Activity | null>(null)
  const [invalid, setInvalid] = useState(false)
  const [alreadyCancelled, setAlreadyCancelled] = useState(false)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const t = useT()

  useEffect(() => {
    if (!token) return
    fetch(`/api/cancel/${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (!res.ok) {
          setInvalid(true)
          return
        }
        const data = await res.json() as { registration: Registration; activity: Activity }
        setRegistration(data.registration)
        setActivity(data.activity)
        if (data.registration.cancelledAt) setAlreadyCancelled(true)
      })
      .catch(() => setInvalid(true))
      .finally(() => setLoading(false))
  }, [token])

  const handleConfirm = async () => {
    if (!token || submitting) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/cancel/${encodeURIComponent(token)}`, { method: 'POST' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: t.error }))
        alert((err as { error?: string }).error ?? t.error)
        return
      }
      if (activity) {
        removeGuestRegistration(activity.id)
        notifyActivitiesChanged()
      }
      setSuccess(true)
    } catch {
      alert(t.error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-lg mx-auto px-4 py-8 page-enter w-full">
        {loading ? (
          <p className="text-center text-gray-400 py-16">{t.loading}</p>
        ) : invalid ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">😕</div>
            <h2 className="text-xl font-bold mb-2">{t.cancelInvalidLink}</h2>
            <Link href="/" className="btn-primary inline-block mt-4">{t.backToHome}</Link>
          </div>
        ) : success ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold mb-2">{t.cancelSuccessTitle}</h2>
            <p className="text-gray-600 mb-2">{t.cancelSuccessDesc}</p>
            <p className="text-sm text-gray-500 mb-8">{t.cancelSuccessSlotReleased}</p>
            <div className="flex flex-col gap-3">
              {activity && (
                <Link href={`/event/${activity.id}`} className="btn-primary block text-center">
                  {t.viewDetails}
                </Link>
              )}
              <Link href="/" className="btn-secondary block text-center">{t.backToHome}</Link>
            </div>
          </div>
        ) : alreadyCancelled ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">ℹ️</div>
            <h2 className="text-xl font-bold mb-2">{t.cancelAlreadyTitle}</h2>
            {activity && (
              <Link href={`/event/${activity.id}`} className="btn-secondary inline-block mt-4">
                {t.backToActivity}
              </Link>
            )}
          </div>
        ) : registration && activity ? (
          <div>
            <h1 className="text-xl font-bold mb-6">{t.cancelPageTitle}</h1>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3 mb-6">
              <p><span className="text-gray-500">{t.cancelActivity}：</span>{activity.title}</p>
              {activity.date && (
                <p><span className="text-gray-500">{t.cancelDate}：</span>{formatEventDate(activity.date)}</p>
              )}
              <p><span className="text-gray-500">{t.cancelLocation}：</span>{activity.location || t.locationTbd}</p>
              <hr className="border-gray-100" />
              <p><span className="text-gray-500">{t.cancelRegistrant}：</span>{registration.name}</p>
              <p><span className="text-gray-500">{t.cancelParticipantCount}：</span>{registration.participantCount}</p>
            </div>
            <p className="text-gray-600 mb-6 text-center">{t.cancelConfirmQuestion}</p>
            <div className="flex gap-3">
              <button
                type="button"
                className="btn-primary flex-1"
                onClick={handleConfirm}
                disabled={submitting}
              >
                {submitting ? t.processing : t.cancelConfirmButton}
              </button>
              <Link href={`/event/${activity.id}`} className="btn-secondary flex-1 text-center">
                {t.backToActivity}
              </Link>
            </div>
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  )
}
