import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ActivityWithCount } from '../../shared/types'
import { ActivityCard } from '../components/ActivityCard'
import { Header } from '../components/layout/Header'
import { ProposalCard } from '../components/ProposalCard'
import { api } from '../lib/api'

export function HomePage() {
  const [activities, setActivities] = useState<ActivityWithCount[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    api.getActivities()
      .then(setActivities)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const recruiting = activities.filter((a) => a.status === 'recruiting')
  const proposed = activities.filter((a) => a.status === 'proposed')

  return (
    <div className="min-h-screen pb-12">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-6 page-enter">
        {loading ? (
          <div className="text-center text-gray-400 py-12">加载中...</div>
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
                    <ProposalCard key={a.id} activity={a} onInterest={load} />
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
