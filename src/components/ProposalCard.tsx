import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ActivityWithCount } from '../../shared/types'
import { api } from '../lib/api'
import { getCategoryEmoji, getCategoryLabel } from '../lib/categories'
import { formatRelativeTime, getSourceIcon, getUser, hasInterest, setInterest } from '../lib/user'
import { UserIdentityModal } from './UserIdentityModal'

interface Props {
  activity: ActivityWithCount
  onInterest?: () => void
}

export function ProposalCard({ activity, onInterest }: Props) {
  const [interested, setInterested] = useState(hasInterest(activity.id))
  const [count, setCount] = useState(activity.interestedCount)
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const hot = count >= 5

  useEffect(() => {
    setCount(activity.interestedCount)
  }, [activity.interestedCount])

  const toggleInterest = async () => {
    const user = getUser()
    if (!user) {
      setModalOpen(true)
      return
    }
    if (loading) return
    setLoading(true)
    try {
      if (interested) {
        const res = await api.deleteInterest({
          activityId: activity.id,
          wechat: user.wechat,
        })
        setInterested(false)
        setInterest(activity.id, false)
        setCount(res.interestedCount)
      } else {
        const res = await api.createInterest({
          activityId: activity.id,
          name: user.name,
          wechat: user.wechat,
        })
        setInterested(true)
        setInterest(activity.id, true)
        setCount(res.interestedCount)
      }
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
        <Link to={`/event/${activity.id}`} className="block group">
          <div className="flex items-start gap-2 mb-1">
            <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full shrink-0">
              {getCategoryEmoji(activity.category)} {getCategoryLabel(activity.category)}
            </span>
          </div>
          <h3 className="font-semibold text-base mb-1 group-hover:text-green-700 transition-colors">
            {getSourceIcon(activity.sourceUrl)} {activity.title}
          </h3>
        </Link>
        <p className="text-xs text-gray-400 mb-2">
          {activity.organizerName || '匿名'} · {formatRelativeTime(activity.createdAt)}
        </p>
        <p className={`text-sm text-gray-600 mb-2 ${expanded ? '' : 'line-clamp-2'}`}>
          {activity.description}
        </p>
        {expanded && (
          <div className="text-sm text-gray-600 space-y-1 mb-3 pl-1 border-l-2 border-green-100">
            {activity.location && <p>📍 {activity.location}</p>}
            {activity.fee && <p>💰 {activity.fee}</p>}
            {activity.notes && <p className="whitespace-pre-wrap text-gray-500">{activity.notes}</p>}
            {activity.sourceUrl && (
              <a href={activity.sourceUrl} target="_blank" rel="noreferrer" className="text-green-600 underline block truncate">
                🔗 参考链接
              </a>
            )}
            <Link to={`/event/${activity.id}`} className="text-green-600 text-sm inline-block mt-1">
              查看完整详情 →
            </Link>
          </div>
        )}
        <button
          type="button"
          className="text-green-600 text-xs mb-3"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? '收起 ▴' : '展开更多 ▾'}
        </button>
        <p className="text-sm text-green-700 mb-3">💡 {count}人感兴趣</p>
        <div className="flex gap-2">
          <button
            type="button"
            className={`flex-1 rounded-xl py-2 text-sm font-medium border transition-colors ${
              interested
                ? 'border-green-300 bg-green-50 text-green-700'
                : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
            }`}
            onClick={toggleInterest}
            disabled={loading}
          >
            {loading ? '...' : interested ? '💔 取消感兴趣' : '❤️ 我也感兴趣'}
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
        onSave={() => toggleInterest()}
      />
    </>
  )
}
