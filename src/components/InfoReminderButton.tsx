'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { api } from '@/src/lib/api'

interface Props {
  activityId: string
  compact?: boolean
}

export function InfoReminderButton({ activityId, compact }: Props) {
  const { isSignedIn, isLoaded } = useUser()
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isLoaded) return
    api
      .getInfoInterestStatus(activityId)
      .then(({ subscribed: s }) => setSubscribed(s))
      .catch(() => setSubscribed(false))
  }, [activityId, isLoaded, isSignedIn])

  const subscribe = async (guestEmail?: string) => {
    setLoading(true)
    setError('')
    try {
      await api.subscribeInfoReminder({ activityId, email: guestEmail })
      setSubscribed(true)
      setModalOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : '设置失败')
    } finally {
      setLoading(false)
    }
  }

  const unsubscribe = async () => {
    setLoading(true)
    try {
      await api.unsubscribeInfoReminder(activityId)
      setSubscribed(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : '取消失败')
    } finally {
      setLoading(false)
    }
  }

  const handleClick = () => {
    if (subscribed) {
      unsubscribe()
      return
    }
    if (isSignedIn) {
      subscribe()
      return
    }
    setModalOpen(true)
  }

  const btnClass = compact ? 'text-sm btn-secondary' : 'text-sm btn-secondary'

  return (
    <>
      <button
        type="button"
        className={btnClass}
        onClick={handleClick}
        disabled={loading}
      >
        {subscribed ? '🔔 已设置提醒' : '🔔 提醒我'}
      </button>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-lg mb-2">设置资讯提醒</h3>
            <p className="text-sm text-gray-600 mb-4">请输入邮箱，我们会在行动开始前和截止前提醒你。</p>
            <input
              className="input-field mb-2"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
            <div className="flex gap-3 mt-4">
              <button type="button" className="btn-secondary flex-1" onClick={() => setModalOpen(false)}>
                取消
              </button>
              <button
                type="button"
                className="btn-primary flex-1"
                disabled={loading || !email.trim()}
                onClick={() => subscribe(email.trim())}
              >
                {loading ? '保存中...' : '确认'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
