import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ActivityCategory, ActivityWithCount } from '../../shared/types'
import { ActivityCard } from '../components/ActivityCard'
import { CategoryFilter, matchesCategoryFilter } from '../components/CategoryFilter'
import { Header } from '../components/layout/Header'
import { PastActivityCard } from '../components/PastActivityCard'
import { ProposalCard } from '../components/ProposalCard'
import { isEndedCancelled, isEndedSuccess } from '../lib/activityStatus'
import { api } from '../lib/api'
import { getUser, isRegistered, setRegistered } from '../lib/user'

export function HomePage() {
  const [activities, setActivities] = useState<ActivityWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [recruitingFilter, setRecruitingFilter] = useState<ActivityCategory[]>([])
  const [proposalFilter, setProposalFilter] = useState<ActivityCategory[]>([])
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set())
  const [pastExpanded, setPastExpanded] = useState(false)

  const syncRegistrations = useCallback(async (list: ActivityWithCount[]) => {
    const user = getUser()
    if (!user) {
      setRegisteredIds(new Set())
      return
    }
    const recruiting = list.filter((a) => a.status === 'recruiting')
    if (recruiting.length === 0) {
      setRegisteredIds(new Set())
      return
    }
    const results = await Promise.all(
      recruiting.map((a) => api.getMyRegistration(a.id, user.wechat).catch(() => ({ registration: null })))
    )
    const ids = new Set<string>()
    recruiting.forEach((a, i) => {
      if (results[i].registration) {
        ids.add(a.id)
        setRegistered(a.id, true)
      } else if (!isRegistered(a.id)) {
        setRegistered(a.id, false)
      }
    })
    setRegisteredIds(ids)
  }, [])

  const load = useCallback(() => {
    setLoading(true)
    setError(false)
    api.getActivities()
      .then((list) => {
        setActivities(list)
        return syncRegistrations(list)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [syncRegistrations])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const refresh = () => {
      api.getActivities()
        .then((list) => {
          setActivities(list)
          syncRegistrations(list)
        })
        .catch(() => {})
    }
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    window.addEventListener('pageshow', refresh)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.removeEventListener('pageshow', refresh)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [syncRegistrations])

  const visible = activities.filter((a) => !isEndedCancelled(a.status))

  const recruiting = visible
    .filter((a) => a.status === 'recruiting')
    .filter((a) => matchesCategoryFilter(a.category, recruitingFilter))
  const proposed = visible
    .filter((a) => a.status === 'proposed')
    .filter((a) => matchesCategoryFilter(a.category, proposalFilter))
  const past = visible.filter((a) => isEndedSuccess(a.status))

  return (
    <div className="min-h-screen pb-12">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-6 page-enter">
        {loading ? (
          <div className="text-center text-gray-400 py-12">加载中...</div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">加载失败，API 可能还在启动中</p>
            <button type="button" className="btn-primary" onClick={load}>重试</button>
          </div>
        ) : (
          <>
            <section className="mb-10">
              <h2 className="section-title">🟢 正在招募</h2>
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
                      registered={registeredIds.has(a.id) || isRegistered(a.id)}
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="section-title mb-0">💡 提议池</h2>
                  <p className="text-sm text-gray-500 mt-1">有好去处？告诉大家</p>
                </div>
                <Link to="/propose" className="btn-primary text-sm whitespace-nowrap">
                  + 我有个提议
                </Link>
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
                  <h2 className="section-title mb-0">✅ 往期活动</h2>
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
    </div>
  )
}
