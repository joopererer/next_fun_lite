'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Profile } from '@/shared/types'
import { api } from '@/src/lib/api'
import { Header } from '@/src/components/layout/Header'
import { Footer } from '@/src/components/layout/Footer'
import { useT } from '@/src/i18n/LanguageContext'

export function NotificationSettingsPage() {
  const { user, isLoaded } = useUser()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [notificationEmail, setNotificationEmail] = useState('')
  const [notifyRegistrationChange, setNotifyRegistrationChange] = useState(true)
  const [notifyProposalRecruiting, setNotifyProposalRecruiting] = useState(true)
  const [notifyNewRecruit, setNotifyNewRecruit] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const t = useT()
  const loginEmail = user?.emailAddresses[0]?.emailAddress ?? ''

  useEffect(() => {
    if (!isLoaded) return
    api
      .getProfile()
      .then((p) => {
        if (!p) return
        setProfile(p)
        setNotificationEmail(p.notificationEmail ?? '')
        setNotifyRegistrationChange(p.notifyRegistrationChange)
        setNotifyProposalRecruiting(p.notifyProposalRecruiting)
        setNotifyNewRecruit(p.notifyNewRecruit)
      })
      .catch(() => {})
  }, [isLoaded])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const updated = await api.saveProfile({
        nickname: profile?.nickname,
        notificationEmail: notificationEmail.trim() || undefined,
        notifyRegistrationChange,
        notifyProposalRecruiting,
        notifyNewRecruit,
      })
      setProfile(updated)
      setSaved(true)
    } catch (err) {
      alert(err instanceof Error ? err.message : t.error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-warm-bg">
      <Header />
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
        <Link href="/" className="text-sm text-gray-500 hover:text-green-700 mb-4 inline-block">
          ← {t.backToHome}
        </Link>
        <h1 className="text-xl font-bold text-gray-900 mb-6">{t.notifSettingsTitle}</h1>

        <div className="space-y-6">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">{t.notifEmail}</label>
            <input
              className="input-field"
              type="email"
              value={notificationEmail}
              onChange={(e) => setNotificationEmail(e.target.value)}
              placeholder={t.notifEmailPlaceholder(loginEmail)}
            />
            {loginEmail && (
              <p className="text-xs text-gray-500 mt-1">{t.notifEmailHint(loginEmail)}</p>
            )}
          </div>

          <fieldset>
            <legend className="text-sm font-medium text-gray-700 mb-2">{t.notifEmailSection}</legend>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={notifyRegistrationChange}
                onChange={(e) => setNotifyRegistrationChange(e.target.checked)}
              />
              {t.notifOnActivityChange}
            </label>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-medium text-gray-700 mb-2">{t.notifInAppSection}</legend>
            <label className="flex items-center gap-2 text-sm mb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyProposalRecruiting}
                onChange={(e) => setNotifyProposalRecruiting(e.target.checked)}
              />
              {t.notifOnProposalRecruit}
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={notifyNewRecruit}
                onChange={(e) => setNotifyNewRecruit(e.target.checked)}
              />
              {t.notifOnNewRecruit}
            </label>
          </fieldset>

          <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 text-sm text-gray-600">
            <p className="font-medium text-gray-700 mb-1">{t.notifCalendarTitle}</p>
            <p>{t.notifCalendarDesc}</p>
          </div>

          <button type="button" className="btn-primary w-full" onClick={handleSave} disabled={saving}>
            {saving ? t.saving : saved ? t.saved : t.saveSettings}
          </button>
        </div>
      </main>
      <Footer />
    </div>
  )
}
