'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { SignInButton, useUser } from '@clerk/nextjs'
import type { ActivityWithCount, Registration } from '@/shared/types'
import { Header } from '@/src/components/layout/Header'
import { MyRegistrationCard } from '@/src/components/MyRegistrationCard'
import { isEndedCancelled, isEndedSuccess } from '@/src/lib/activityStatus'
import { api } from '@/src/lib/api'
import { getRegistrationIds } from '@/src/lib/registrations'

export function MyRegistrationsPage() {
  const { isSignedIn, isLoaded } = useUser()
  const [activities, setActivities] = useState<ActivityWithCount[]>([])
  const [registrations, setRegistrations] = useState<Map<string, Registration>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoaded) return

    if (isSignedIn) {
      api.getMyRegistrations()
        .then((res) => {
          setActivities(res.activities)
          setRegistrations(new Map(Object.entries(res.registrations)))
        })
        .finally(() => setLoading(false))
      return
    }

    const ids = getRegistrationIds()
    if (ids.length === 0) {
      setLoading(false)
      return
    }

    api.getActivitiesByIds(ids)
      .then((list) => setActivities(list))
      .finally(() => setLoading(false))
  }, [isLoaded, isSignedIn])

  const upcoming = activities.filter((a) => a.status === 'recruiting')
  const finished = activities.filter((a) => isEndedSuccess(a.status))
  const cancelled = activities.filter((a) => isEndedCancelled(a.status))

  if (!isLoaded) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="max-w-lg mx-auto px-4 py-16 text-center text-gray-400">加载中...</main>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="max-w-lg mx-auto px-4 py-16 text-center">
          <p className="text-gray-600 mb-4">登录后查看你的报名记录</p>
          <SignInButton mode="modal">
            <button type="button" className="btn-primary">登录 / 注册</button>
          </SignInButton>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-12">
      <Header />
      <main className="max-w-lg mx-auto px-4 py-6 page-enter">
        <Link href="/" className="text-sm text-gray-500 hover:text-green-600 mb-4 inline-block">
          ← 返回首页
        </Link>
        <h1 className="text-2xl font-bold mb-6">📋 我的报名</h1>

        {loading ? (
          <p className="text-center text-gray-400 py-12">加载中...</p>
        ) : activities.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-2">还没有报名记录</p>
            <p className="text-sm text-gray-400 mb-6">去首页看看有什么活动？</p>
            <Link href="/" className="btn-primary inline-block">去首页</Link>
          </div>
        ) : (
          <div className="space-y-8">
            {upcoming.length > 0 && (
              <section>
                <h2 className="text-sm text-gray-400 mb-3 border-b border-gray-100 pb-2">即将参加</h2>
                <div className="space-y-3">
                  {upcoming.map((a) => (
                    <MyRegistrationCard
                      key={a.id}
                      activity={a}
                      registration={registrations.get(a.id)}
                    />
                  ))}
                </div>
              </section>
            )}
            {finished.length > 0 && (
              <section>
                <h2 className="text-sm text-gray-400 mb-3 border-b border-gray-100 pb-2">已结束</h2>
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
                <h2 className="text-sm text-gray-400 mb-3 border-b border-gray-100 pb-2">已取消</h2>
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
    </div>
  )
}
