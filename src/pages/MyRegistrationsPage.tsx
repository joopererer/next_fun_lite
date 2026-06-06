import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ActivityWithCount, Registration } from '../../shared/types'
import { Header } from '../components/layout/Header'
import { MyRegistrationCard } from '../components/MyRegistrationCard'
import { UserIdentityModal } from '../components/UserIdentityModal'
import { isEndedCancelled, isEndedSuccess } from '../lib/activityStatus'
import { api } from '../lib/api'
import { getRegistrationIds } from '../lib/registrations'
import { getUser } from '../lib/user'

export function MyRegistrationsPage() {
  const [activities, setActivities] = useState<ActivityWithCount[]>([])
  const [registrations, setRegistrations] = useState<Map<string, Registration>>(new Map())
  const [loading, setLoading] = useState(true)
  const [identityModal, setIdentityModal] = useState(false)
  const user = getUser()

  useEffect(() => {
    const ids = getRegistrationIds()
    if (ids.length === 0) {
      setLoading(false)
      return
    }

    const u = getUser()
    api.getActivitiesByIds(ids)
      .then(async (list) => {
        setActivities(list)
        if (!u) return
        const regMap = new Map<string, Registration>()
        await Promise.all(
          list.map(async (a) => {
            const res = await api.getMyRegistration(a.id, u.wechat).catch(() => ({ registration: null }))
            if (res.registration) regMap.set(a.id, res.registration)
          })
        )
        setRegistrations(regMap)
      })
      .finally(() => setLoading(false))
  }, [])

  const upcoming = activities.filter((a) => a.status === 'recruiting')
  const finished = activities.filter((a) => isEndedSuccess(a.status))
  const cancelled = activities.filter((a) => isEndedCancelled(a.status))

  if (!user) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="max-w-lg mx-auto px-4 py-16 text-center">
          <p className="text-gray-600 mb-4">请先设置昵称，才能查看报名记录</p>
          <button type="button" className="btn-primary" onClick={() => setIdentityModal(true)}>
            填写身份信息
          </button>
          <UserIdentityModal open={identityModal} onClose={() => setIdentityModal(false)} />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-12">
      <Header />
      <main className="max-w-lg mx-auto px-4 py-6 page-enter">
        <Link to="/" className="text-sm text-gray-500 hover:text-green-600 mb-4 inline-block">
          ← 返回首页
        </Link>
        <h1 className="text-2xl font-bold mb-6">📋 我的报名</h1>

        {loading ? (
          <p className="text-center text-gray-400 py-12">加载中...</p>
        ) : activities.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-2">还没有报名记录</p>
            <p className="text-sm text-gray-400 mb-6">去首页看看有什么活动？</p>
            <Link to="/" className="btn-primary inline-block">去首页</Link>
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
