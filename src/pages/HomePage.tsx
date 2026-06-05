import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ActivityWithCount } from '../../shared/types'
import { ActivityCard } from '../components/ActivityCard'
import { Header } from '../components/layout/Header'
import { ProposalCard } from '../components/ProposalCard'
import { api } from '../lib/api'

export function HomePage() {
  const [activities, setActivities] = useState<ActivityWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    setError(false)
    api.getActivities()
      .then(setActivities)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const recruiting = activities.filter((a) => a.status === 'recruiting')
  const proposed = activities.filter((a) => a.status === 'proposed')

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
              {recruiting.length === 0 ? (
                <p className="text-gray-400 text-sm">暂无招募中的活动</p>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 snap-x md:grid md:grid-cols-2 md:overflow-visible md:mx-0 md:px-0">
                  {recruiting.map((a) => (
                    <div key={a.id} className="snap-start shrink-0 md:shrink">
                      <ActivityCard activity={a} />
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="section-title mb-0">💡 提议池</h2>
                  <p className="text-sm text-gray-500 mt-1">有好去处？告诉大家</p>
                </div>
                <Link to="/propose" className="btn-primary text-sm whitespace-nowrap">
                  + 我有个提议
                </Link>
              </div>
              {proposed.length === 0 ? (
                <p className="text-gray-400 text-sm">还没有提议，来做第一个吧！</p>
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
          </>
        )}
      </main>
    </div>
  )
}
