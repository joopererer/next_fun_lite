'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { SignInButton, useUser } from '@clerk/nextjs'
import type { ActivityWithCount, Registration } from '@/shared/types'
import { Header } from '@/src/components/layout/Header'
import { Footer } from '@/src/components/layout/Footer'
import { MyRegistrationCard } from '@/src/components/MyRegistrationCard'
import { MyPublishedCard } from '@/src/components/MyPublishedCard'
import { MyRegistrationsCalendar } from '@/src/components/MyRegistrationsCalendar'
import { isEndedCancelled, isEndedSuccess } from '@/src/lib/activityStatus'
import { api } from '@/src/lib/api'
import { getGuestRegistrations, type GuestRegistrationRecord } from '@/src/lib/guestRegistrations'
import { ACTIVITIES_CHANGED_EVENT } from '@/src/lib/activityEvents'
import { useT } from '@/src/i18n/LanguageContext'

type ViewMode = 'list' | 'calendar'
const VIEW_KEY = 'nfl_my_view'

function getStoredView(): ViewMode {
  if (typeof window === 'undefined') return 'list'
  return localStorage.getItem(VIEW_KEY) === 'calendar' ? 'calendar' : 'list'
}

function guestToRegistration(guest: GuestRegistrationRecord): Registration {
  return {
    id: `guest-${guest.activityId}`,
    activityId: guest.activityId,
    name: guest.name,
    wechat: '',
    participantCount: guest.participantCount,
    note: '',
    registeredAt: guest.registeredAt,
    cancelToken: guest.cancelToken,
  }
}

export function MyRegistrationsPage() {
  const { isSignedIn, isLoaded } = useUser()
  const [activities, setActivities] = useState<ActivityWithCount[]>([])
  const [published, setPublished] = useState<ActivityWithCount[]>([])
  const [registrations, setRegistrations] = useState<Map<string, Registration>>(new Map())
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<ViewMode>('list')
  const t = useT()

  const loadGuestOnly = useCallback(async () => {
    const guests = getGuestRegistrations()
    if (guests.length === 0) {
      setActivities([])
      setRegistrations(new Map())
      return
    }
    const results = await Promise.all(
      guests.map(async (g) => {
        try {
          const activity = await api.getActivity(g.activityId)
          return { activity, registration: guestToRegistration(g) }
        } catch {
          return null
        }
      }),
    )
    const valid = results.filter((r): r is NonNullable<typeof r> => r != null)
    setActivities(valid.map((r) => r.activity))
    setRegistrations(new Map(valid.map((r) => [r.activity.id, r.registration])))
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      if (isSignedIn) {
        const [regRes, pubRes] = await Promise.all([
          api.getMyRegistrations(),
          api.getMyActivities(),
        ])
        const regMap = new Map(Object.entries(regRes.registrations))
        const activityMap = new Map(regRes.activities.map((a) => [a.id, a]))

        for (const guest of getGuestRegistrations()) {
          if (regMap.has(guest.activityId)) continue
          try {
            const activity = await api.getActivity(guest.activityId)
            regMap.set(guest.activityId, guestToRegistration(guest))
            activityMap.set(activity.id, activity)
          } catch {
            /* skip stale guest record */
          }
        }

        setActivities([...activityMap.values()])
        setRegistrations(regMap)
        setPublished(pubRes.activities)
      } else {
        setPublished([])
        await loadGuestOnly()
      }
    } finally {
      setLoading(false)
    }
  }, [isSignedIn, loadGuestOnly])

  useEffect(() => {
    if (!isLoaded) return
    setView(getStoredView())
    load()
  }, [isLoaded, isSignedIn, load])

  useEffect(() => {
    const refresh = () => { load() }
    window.addEventListener(ACTIVITIES_CHANGED_EVENT, refresh)
    window.addEventListener('pageshow', refresh)
    return () => {
      window.removeEventListener(ACTIVITIES_CHANGED_EVENT, refresh)
      window.removeEventListener('pageshow', refresh)
    }
  }, [load])

  const switchView = (mode: ViewMode) => {
    setView(mode)
    localStorage.setItem(VIEW_KEY, mode)
  }

  const activeReg = (activityId: string) => {
    const reg = registrations.get(activityId)
    return reg && !reg.cancelledAt ? reg : undefined
  }

  const upcoming = activities.filter(
    (a) => a.status === 'recruiting' && activeReg(a.id),
  )
  const finished = activities.filter((a) => isEndedSuccess(a.status))
  const cancelled = activities.filter((a) => isEndedCancelled(a.status))

  const hasRegistrations = activities.some(
    (a) => activeReg(a.id) || isEndedSuccess(a.status) || isEndedCancelled(a.status),
  )
  const hasPublished = published.length > 0
  const hasAnyContent = hasRegistrations || hasPublished

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 max-w-lg mx-auto px-4 py-16 text-center text-gray-400">{t.loading}</main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-lg mx-auto px-4 py-6 page-enter w-full">
        <Link href="/" className="text-sm text-gray-500 hover:text-green-600 mb-4 inline-block">
          ← {t.backToHome}
        </Link>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{t.myTitle}</h1>
          {hasRegistrations && (
            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
              <button
                type="button"
                className={`px-3 py-1.5 ${view === 'list' ? 'bg-green-50 text-green-700' : 'text-gray-500'}`}
                onClick={() => switchView('list')}
              >
                {t.viewModeList}
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 ${view === 'calendar' ? 'bg-green-50 text-green-700' : 'text-gray-500'}`}
                onClick={() => switchView('calendar')}
              >
                {t.viewModeCalendar}
              </button>
            </div>
          )}
        </div>

        {!isSignedIn && getGuestRegistrations().length > 0 && (
          <p className="text-xs text-gray-400 mb-4 bg-gray-50 rounded-lg px-3 py-2">
            {t.guestHint}
          </p>
        )}

        {loading ? (
          <p className="text-center text-gray-400 py-12">{t.loading}</p>
        ) : !hasAnyContent ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-2">{t.noMyRegistrations}</p>
            <p className="text-sm text-gray-400 mb-6">{t.backToHome}</p>
            <div className="flex flex-col gap-3 items-center">
              <Link href="/" className="btn-primary inline-block">{t.backToHome}</Link>
              {!isSignedIn && (
                <SignInButton mode="modal">
                  <button type="button" className="btn-secondary">{t.signInButton}</button>
                </SignInButton>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {hasRegistrations && (
              <section>
                <h2 className="text-sm font-semibold text-gray-700 mb-4">📋 {t.myRegistrationsSection}</h2>
                {view === 'calendar' ? (
                  <MyRegistrationsCalendar activities={activities} registrations={registrations} onCancel={load} />
                ) : (
                  <div className="space-y-8">
                    {upcoming.length > 0 && (
                      <div>
                        <h3 className="text-sm text-gray-400 mb-3 border-b border-gray-100 pb-2">🟢 {t.sectionRecruiting}</h3>
                        <div className="space-y-3">
                          {upcoming.map((a) => (
                            <MyRegistrationCard
                              key={a.id}
                              activity={a}
                              registration={registrations.get(a.id)}
                              onCancel={load}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {finished.length > 0 && (
                      <div>
                        <h3 className="text-sm text-gray-400 mb-3 border-b border-gray-100 pb-2">{t.typeEnded}</h3>
                        <div className="space-y-3">
                          {finished.map((a) => (
                            <MyRegistrationCard
                              key={a.id}
                              activity={a}
                              registration={registrations.get(a.id)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {cancelled.length > 0 && (
                      <div>
                        <h3 className="text-sm text-gray-400 mb-3 border-b border-gray-100 pb-2">{t.typeCancelled}</h3>
                        <div className="space-y-3">
                          {cancelled.map((a) => (
                            <MyRegistrationCard key={a.id} activity={a} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}

            {isSignedIn && (
              <section>
                <h2 className="text-sm font-semibold text-gray-700 mb-4">✏️ {t.myPublishedSection}</h2>
                {hasPublished ? (
                  <div className="space-y-3">
                    {published.map((a) => (
                      <MyPublishedCard key={a.id} activity={a} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-sm text-gray-500 mb-4">{t.noMyPublished}</p>
                    <div className="flex flex-wrap gap-2 justify-center text-sm">
                      <Link href="/propose" className="text-green-600 hover:underline">{t.quickPropose}</Link>
                      <span className="text-gray-300">·</span>
                      <Link href="/recruit/new" className="text-green-600 hover:underline">{t.quickRecruit}</Link>
                      <span className="text-gray-300">·</span>
                      <Link href="/info/new" className="text-green-600 hover:underline">{t.quickInfo}</Link>
                    </div>
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
