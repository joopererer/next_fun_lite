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

export function CancelRegistrationPage() {
  const { token } = useParams<{ token: string }>()
  const [loading, setLoading] = useState(true)
  const [registration, setRegistration] = useState<Registration | null>(null)
  const [activity, setActivity] = useState<Activity | null>(null)
  const [invalid, setInvalid] = useState(false)
  const [alreadyCancelled, setAlreadyCancelled] = useState(false)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

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
        const err = await res.json().catch(() => ({ error: '取消失败' }))
        alert((err as { error?: string }).error ?? '取消失败')
        return
      }
      if (activity) {
        removeGuestRegistration(activity.id)
        notifyActivitiesChanged()
      }
      setSuccess(true)
    } catch {
      alert('取消失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-lg mx-auto px-4 py-8 page-enter w-full">
        {loading ? (
          <p className="text-center text-gray-400 py-16">加载中...</p>
        ) : invalid ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">😕</div>
            <h2 className="text-xl font-bold mb-2">链接无效或已过期</h2>
            <Link href="/" className="btn-primary inline-block mt-4">回到首页</Link>
          </div>
        ) : success ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold mb-2">已取消报名</h2>
            <p className="text-gray-600 mb-2">你的报名已成功取消。</p>
            <p className="text-sm text-gray-500 mb-8">名额已释放，其他人可以报名。</p>
            <div className="flex flex-col gap-3">
              {activity && (
                <Link href={`/event/${activity.id}`} className="btn-primary block text-center">
                  查看活动
                </Link>
              )}
              <Link href="/" className="btn-secondary block text-center">回到首页</Link>
            </div>
          </div>
        ) : alreadyCancelled ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">ℹ️</div>
            <h2 className="text-xl font-bold mb-2">该报名已取消</h2>
            {activity && (
              <Link href={`/event/${activity.id}`} className="btn-secondary inline-block mt-4">
                返回活动页
              </Link>
            )}
          </div>
        ) : registration && activity ? (
          <div>
            <h1 className="text-xl font-bold mb-6">取消报名确认</h1>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3 mb-6">
              <p><span className="text-gray-500">活动：</span>{activity.title}</p>
              {activity.date && (
                <p><span className="text-gray-500">时间：</span>{formatEventDate(activity.date)}</p>
              )}
              <p><span className="text-gray-500">地点：</span>{activity.location || '待定'}</p>
              <hr className="border-gray-100" />
              <p><span className="text-gray-500">报名人：</span>{registration.name}</p>
              <p><span className="text-gray-500">参与人数：</span>{registration.participantCount} 人</p>
            </div>
            <p className="text-gray-600 mb-6 text-center">确认要取消这次报名吗？</p>
            <div className="flex gap-3">
              <button
                type="button"
                className="btn-primary flex-1"
                onClick={handleConfirm}
                disabled={submitting}
              >
                {submitting ? '处理中...' : '确认取消'}
              </button>
              <Link href={`/event/${activity.id}`} className="btn-secondary flex-1 text-center">
                返回活动页
              </Link>
            </div>
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  )
}
