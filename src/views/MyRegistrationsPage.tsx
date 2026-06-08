'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { SignInButton, useUser } from '@clerk/nextjs'
import type { ActivityWithCount, Registration } from '@/shared/types'
import { Header } from '@/src/components/layout/Header'
import { Footer } from '@/src/components/layout/Footer'
import { MyRegistrationCard } from '@/src/components/MyRegistrationCard'
import { MyRegistrationsCalendar } from '@/src/components/MyRegistrationsCalendar'
import { isEndedCancelled, isEndedSuccess } from '@/src/lib/activityStatus'
import { api } from '@/src/lib/api'
import { getGuestRegistrations, type GuestRegistrationRecord } from '@/src/lib/guestRegistrations'
import { ACTIVITIES_CHANGED_EVENT } from '@/src/lib/activityEvents'

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
  const [registrations, setRegistrations] = useState<Map<string, Registration>>(new Map())
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<ViewMode>('list')

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
        const res = await api.getMyRegistrations()
        const regMap = new Map(Object.entries(res.registrations))
        const activityMap = new Map(res.activities.map((a) => [a.id, a]))

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
      } else {
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

  const hasRecords = activities.some((a) => activeReg(a.id) || isEndedSuccess(a.status) || isEndedCancelled(a.status))

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 max-w-lg mx-auto px-4 py-16 text-center text-gray-400">加载中...</main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-lg mx-auto px-4 py-6 page-enter w-full">
        <Link href="/" className="text-sm text-gray-500 hover:text-green-600 mb-4 inline-block">
          ← 返回首页
        </Link>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">📋 我的报名</h1>
          {hasRecords && (
            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
              <button
                type="button"
                className={`px-3 py-1.5 ${view === 'list' ? 'bg-green-50 text-green-700' : 'text-gray-500'}`}
                onClick={() => switchView('list')}
              >
                列表
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 ${view === 'calendar' ? 'bg-green-50 text-green-700' : 'text-gray-500'}`}
                onClick={() => switchView('calendar')}
              >
                日历
              </button>
            </div>
          )}
        </div>

        {!isSignedIn && getGuestRegistrations().length > 0 && (
          <p className="text-xs text-gray-400 mb-4 bg-gray-50 rounded-lg px-3 py-2">
            以下为本设备保存的报名记录。登录后不会自动合并，请保留取消链接。
          </p>
        )}

        {loading ? (
          <p className="text-center text-gray-400 py-12">加载中...</p>
        ) : !hasRecords ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-2">还没有报名记录</p>
            <p className="text-sm text-gray-400 mb-6">去首页看看有什么活动？</p>
            {!isSignedIn && (
              <p className="text-xs text-gray-400 mb-4">登录后可同步账号下的报名</p>
            )}
            <div className="flex flex-col gap-3 items-center">
              <Link href="/" className="btn-primary inline-block">去首页</Link>
              {!isSignedIn && (
                <SignInButton mode="modal">
                  <button type="button" className="btn-secondary">登录 / 注册</button>
                </SignInButton>
              )}
            </div>
          </div>
        ) : view === 'calendar' ? (
          <MyRegistrationsCalendar activities={activities} registrations={registrations} onCancel={load} />
        ) : (
          <div className="space-y-8">
            {upcoming.length > 0 && (
              <section>
                <h2 className="text-sm text-gray-400 mb-3 border-b border-gray-100 pb-2">🟢 即将参加</h2>
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
              </section>
            )}
            {finished.length > 0 && (
              <section>
                <h2 className="text-sm text-gray-400 mb-3 border-b border-gray-100 pb-2">✅ 已结束</h2>
                <div className="space-y-3">
                  {finished.map((a) => (
                    <MyRegistrationCard
                      key={a.id}
                      activity={a}
                      registration={registrations.get(a.id)}
                    />
                  ))}
                </div>
              </section>
            )}
            {cancelled.length > 0 && (
              <section>
                <h2 className="text-sm text-gray-400 mb-3 border-b border-gray-100 pb-2">❌ 已取消</h2>
                <div className="space-y-3">
                  {cancelled.map((a) => (
                    <MyRegistrationCard key={a.id} activity={a} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
