'use client'

import { useUser } from '@clerk/nextjs'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import type { ActivityCategory, ActivityWithCount } from '../../shared/types'
import { ActivityCard } from '../components/ActivityCard'
import { CategoryFilter, matchesCategoryFilter } from '../components/CategoryFilter'
import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'
import { PastActivityCard } from '../components/PastActivityCard'
import { ProposalCard } from '../components/ProposalCard'
import { isEndedCancelled, isEndedSuccess } from '../lib/activityStatus'
import { api } from '../lib/api'
import { sortProposalsForHome } from '../lib/proposals'
import { InfoCard } from '../components/InfoCard'
import { HomeNotificationBanner } from '../components/notifications/HomeNotificationBanner'
import { isInfoPost, isInfoVisible, isProposalPost, sortInfosForHome } from '../lib/infoVisibility'
import { ACTIVITIES_CHANGED_EVENT } from '../lib/activityEvents'
import { getGuestRegistrations } from '../lib/guestRegistrations'

export function HomePage() {
  const { isSignedIn, isLoaded } = useUser()
  const [activities, setActivities] = useState<ActivityWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [recruitingFilter, setRecruitingFilter] = useState<ActivityCategory[]>([])
  const [proposalFilter, setProposalFilter] = useState<ActivityCategory[]>([])
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set())
  const [pastExpanded, setPastExpanded] = useState(false)

  const syncRegistrations = useCallback(async () => {
    const guestIds = getGuestRegistrations().map((r) => r.activityId)
    if (!isSignedIn) {
      setRegisteredIds(new Set(guestIds))
      return
    }
    try {
      const { registrations } = await api.getMyRegistrations()
      const ids = new Set(Object.keys(registrations))
      guestIds.forEach((gid) => ids.add(gid))
      setRegisteredIds(ids)
    } catch {
      setRegisteredIds(new Set(guestIds))
    }
  }, [isSignedIn])

  const load = useCallback(() => {
    setLoading(true)
    setError(false)
    api.getActivities()
      .then((list) => {
        setActivities(list)
        return syncRegistrations()
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [syncRegistrations])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!isLoaded) return
    syncRegistrations()
  }, [isLoaded, isSignedIn, syncRegistrations])

  useEffect(() => {
    const refresh = () => {
      api.getActivities()
        .then((list) => {
          setActivities(list)
          syncRegistrations()
        })
        .catch(() => {})
    }
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    window.addEventListener('pageshow', refresh)
    window.addEventListener(ACTIVITIES_CHANGED_EVENT, refresh)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.removeEventListener('pageshow', refresh)
      window.removeEventListener(ACTIVITIES_CHANGED_EVENT, refresh)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [syncRegistrations])

  const visible = activities.filter((a) => !isEndedCancelled(a.status))

  const recruiting = visible
    .filter((a) => a.status === 'recruiting' && !isInfoPost(a))
    .filter((a) => matchesCategoryFilter(a.category, recruitingFilter))
  const infos = sortInfosForHome(visible.filter((a) => isInfoPost(a)))
  const proposedAll = visible
    .filter((a) => isProposalPost(a))
    .filter((a) => matchesCategoryFilter(a.category, proposalFilter))
  const proposed = sortProposalsForHome(proposedAll)
  const proposedOverflow = proposedAll.length > proposed.length
  const past = visible.filter((a) => isEndedSuccess(a.status))
  const allVisibleInfos = visible.filter((a) => isInfoPost(a) && isInfoVisible(a))

  const infoCountLabel =
    infos.length < allVisibleInfos.length
      ? `${infos.length}/${allVisibleInfos.length}`
      : String(infos.length)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {!loading && !error && (
        <div className="sticky top-[57px] z-30 bg-warm-bg/95 backdrop-blur-sm border-b border-gray-100">
          <div className="max-w-3xl mx-auto px-4 py-2">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/propose"
                className="btn-primary inline-flex items-center gap-1.5 text-xs sm:text-sm py-1.5 px-3 sm:px-3.5 rounded-full"
              >
                <span>💡</span>
                <span className="sm:hidden">提议</span>
                <span className="hidden sm:inline">我有个提议</span>
              </Link>
              <Link
                href="/recruit/new"
                className="btn-primary inline-flex items-center gap-1.5 text-xs sm:text-sm py-1.5 px-3 sm:px-3.5 rounded-full"
              >
                <span>🟢</span>
                <span className="sm:hidden">招募</span>
                <span className="hidden sm:inline">发起招募</span>
              </Link>
              <Link
                href="/info/new"
                className="btn-primary inline-flex items-center gap-1.5 text-xs sm:text-sm py-1.5 px-3 sm:px-3.5 rounded-full"
              >
                <span>📢</span>
                <span className="sm:hidden">资讯</span>
                <span className="hidden sm:inline">发布资讯</span>
              </Link>
            </div>
          </div>
        </div>
      )}
      <main className="flex-1 max-w-3xl mx-auto px-4 py-6 page-enter w-full">
        {loading ? (
          <div className="text-center text-gray-400 py-12">加载中...</div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">加载失败，API 可能还在启动中</p>
            <button type="button" className="btn-primary" onClick={load}>重试</button>
          </div>
        ) : (
          <>
            <HomeNotificationBanner />
            <section className="mb-10">
              <h2 className="section-title">
                🟢 正在招募
                <span className="text-base font-normal text-gray-400 ml-2">({recruiting.length})</span>
              </h2>
              <div className="mb-3">
                <CategoryFilter selected={recruitingFilter} onChange={setRecruitingFilter} />
              </div>
              {recruiting.length === 0 ? (
                <p className="text-gray-400 text-sm">
                  {recruitingFilter.length > 0 ? '暂无该类型活动' : '暂无招募中的活动'}
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {recruiting.map((a) => (
                    <ActivityCard
                      key={a.id}
                      activity={a}
                      registered={registeredIds.has(a.id)}
                      onRegistered={(id) => setRegisteredIds((prev) => new Set([...prev, id]))}
                    />
                  ))}
                </div>
              )}
            </section>

            {allVisibleInfos.length > 0 && (
              <section className="mb-10">
                <h2 className="section-title">
                  📢 近期资讯
                  <span className="text-base font-normal text-gray-400 ml-2">({infoCountLabel})</span>
                </h2>
                {infos.length === 0 ? (
                  <p className="text-gray-400 text-sm">暂无未过期的资讯</p>
                ) : (
                  <div className="space-y-4">
                    {infos.map((a) => (
                      <InfoCard key={a.id} activity={a} />
                    ))}
                  </div>
                )}
              </section>
            )}

            <section className="mb-10">
              <div className="mb-4">
                <h2 className="section-title mb-0">
                  💡 提议池
                  <span className="text-base font-normal text-gray-400 ml-2">({proposedAll.length})</span>
                </h2>
                <p className="text-sm text-gray-500 mt-1">有好去处？告诉大家</p>
              </div>
              <div className="mb-3">
                <CategoryFilter selected={proposalFilter} onChange={setProposalFilter} />
              </div>
              {proposed.length === 0 ? (
                <p className="text-gray-400 text-sm">
                  {proposalFilter.length > 0 ? '暂无该类型活动' : '还没有提议，来做第一个吧！'}
                </p>
              ) : (
                <div className="space-y-4">
                  {proposed.map((a) => (
                    <ProposalCard
                      key={a.id}
                      activity={a}
                      onInterestUpdate={(id, interestedCount) => {
                        setActivities((prev) =>
                          prev.map((item) =>
                            item.id === id ? { ...item, interestedCount } : item
                          )
                        )
                      }}
                    />
                  ))}
                  {proposedOverflow && (
                    <div className="text-right pt-2">
                      <Link href="/proposals" className="text-sm text-green-600 hover:underline">
                        查看全部提议（共{proposedAll.length}条）→
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </section>

            {past.length > 0 && (
              <section>
                <button
                  type="button"
                  className="flex items-center gap-2 text-left w-full mb-3"
                  onClick={() => setPastExpanded(!pastExpanded)}
                >
                  <h2 className="section-title mb-0">
                    ✅ 往期活动
                    <span className="text-base font-normal text-gray-400 ml-2">({past.length})</span>
                  </h2>
                  <span className="text-sm text-gray-400">{pastExpanded ? '▴' : '▾'}</span>
                </button>
                {pastExpanded && (
                  <div className="space-y-3">
                    {past.map((a) => (
                      <PastActivityCard key={a.id} activity={a} />
                    ))}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
