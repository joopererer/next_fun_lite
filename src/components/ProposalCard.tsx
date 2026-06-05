import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { ActivityWithCount } from '../../shared/types'
import { api } from '../lib/api'
import { formatRelativeTime, getSourceIcon, getUser, hasInterest, markInterest } from '../lib/user'
import { UserIdentityModal } from './UserIdentityModal'

interface Props {
  activity: ActivityWithCount
  onInterest?: () => void
}

export function ProposalCard({ activity, onInterest }: Props) {
  const [interested, setInterested] = useState(hasInterest(activity.id))
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const hot = activity.interestedCount >= 5

  const handleInterest = async () => {
    const user = getUser()
    if (!user) {
      setModalOpen(true)
      return
    }
    if (interested || loading) return
    setLoading(true)
    try {
      await api.createInterest({
        activityId: activity.id,
        name: user.name,
        wechat: user.wechat,
      })
      markInterest(activity.id)
      setInterested(true)
      onInterest?.()
    } catch (err) {
      alert(err instanceof Error ? err.message : '操作失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 card-hover relative">
        {hot && (
          <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
            🔥
          </span>
        )}
        <h3 className="font-semibold text-base mb-1">
          {getSourceIcon(activity.sourceUrl)} {activity.title}
        </h3>
        <p className="text-xs text-gray-400 mb-2">
          {activity.organizerName || '匿名'} · {formatRelativeTime(activity.createdAt)}
        </p>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{activity.description}</p>
        <p className="text-sm text-green-700 mb-3">💡 {activity.interestedCount}人感兴趣</p>
        <div className="flex gap-2">
          <button
            type="button"
            className={`flex-1 rounded-xl py-2 text-sm font-medium border transition-colors ${
              interested
                ? 'border-green-200 bg-green-50 text-green-600'
                : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
            }`}
            onClick={handleInterest}
            disabled={interested || loading}
          >
            {interested ? '❤️ 已感兴趣' : '❤️ 我也感兴趣'}
          </button>
          <Link
            to={`/admin?tab=create&from=${activity.id}`}
            className="flex-1 btn-secondary text-sm text-center py-2"
          >
            发起招募 →
          </Link>
        </div>
      </div>
      <UserIdentityModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={() => handleInterest()}
      />
    </>
  )
}
