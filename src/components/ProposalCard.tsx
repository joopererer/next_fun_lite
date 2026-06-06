import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ActivityWithCount } from '../../shared/types'
import { api } from '../lib/api'
import { formatEventDate } from '../lib/user'
import { getCategoryEmoji, getCategoryLabel } from '../lib/categories'
import { getFeeLevelEmoji, getFeeLevelLabel } from '../lib/feeLevel'
import { formatRelativeTime, getSourceIcon, getUser, setInterest } from '../lib/user'
import { UserIdentityModal } from './UserIdentityModal'
import { ItineraryBlock } from './ItineraryBlock'

interface Props {
  activity: ActivityWithCount
  onInterestUpdate?: (activityId: string, interestedCount: number) => void
}

export function ProposalCard({ activity, onInterestUpdate }: Props) {
  const [interested, setInterested] = useState(false)
  const [count, setCount] = useState(activity.interestedCount ?? 0)
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [linkedRecruits, setLinkedRecruits] = useState<ActivityWithCount[]>([])
  const hot = count >= 5

  useEffect(() => {
    if (!expanded || !activity.linkedRecruitIds?.length) {
      setLinkedRecruits([])
      return
    }
    api.getActivitiesByIds(activity.linkedRecruitIds)
      .then(setLinkedRecruits)
      .catch(() => setLinkedRecruits([]))
  }, [expanded, activity.id, activity.linkedRecruitIds])

  useEffect(() => {
    setCount(activity.interestedCount ?? 0)
  }, [activity.id, activity.interestedCount])

  useEffect(() => {
    const user = getUser()
    if (!user) {
      setInterested(false)
      return
    }

    api.getInterests(activity.id)
      .then((interests) => {
        const mine = interests.some((i) => i.wechat === user.wechat)
        setInterested(mine)
        setInterest(activity.id, mine)
      })
      .catch(() => setInterested(false))
  }, [activity.id])

  const toggleInterest = async () => {
    const user = getUser()
    if (!user) {
      setModalOpen(true)
      return
    }
    if (loading) return
    setLoading(true)
    try {
      const res = interested
        ? await api.deleteInterest({ activityId: activity.id, wechat: user.wechat })
        : await api.createInterest({
            activityId: activity.id,
            name: user.name,
            wechat: user.wechat,
          })

      const nextCount =
        typeof res.interestedCount === 'number'
          ? res.interestedCount
          : interested
            ? Math.max(0, count - 1)
            : count + 1
      const nextInterested = !interested

      setInterested(nextInterested)
      setInterest(activity.id, nextInterested)
      setCount(nextCount)
      onInterestUpdate?.(activity.id, nextCount)
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
            {activity.feeLevel && (
              <p>
                {getFeeLevelEmoji(activity.feeLevel)} {getFeeLevelLabel(activity.feeLevel)}
                {activity.fee && activity.feeLevel === 'paid' ? ` · ${activity.fee}` : ''}
              </p>
            )}
            {activity.fee && activity.feeLevel !== 'paid' && <p>💰 {activity.fee}</p>}
            {activity.itinerary && (
              <div className="mt-2">
                <ItineraryBlock itinerary={activity.itinerary} />
              </div>
            )}
            {activity.notes && <p className="whitespace-pre-wrap text-gray-500">{activity.notes}</p>}
            {linkedRecruits.length > 0 && (
              <div className="mt-3 pt-3 border-t border-green-100">
                <p className="text-sm font-medium text-green-800 mb-2">🟢 已有招募活动：</p>
                <ul className="space-y-2">
                  {linkedRecruits.map((r) => (
                    <li key={r.id} className="text-sm">
                      · {r.title}{' '}
                      <span className="text-gray-500">
                        {formatEventDate(r.date).replace(/ .*/, '')}{' '}
                        {r.registeredCount}{r.maxParticipants ? `/${r.maxParticipants}` : ''}人
                      </span>{' '}
                      <Link to={`/event/${r.id}`} className="text-green-600 underline">
                        去报名 →
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
                ? 'border-gray-300 bg-gray-100 text-gray-600'
                : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
            }`}
            onClick={toggleInterest}
            disabled={loading}
          >
            {loading ? '...' : interested ? '❤️ 不再感兴趣' : '❤️ 我也感兴趣'}
          </button>
          <Link
            to={`/recruit/new?from=${activity.id}`}
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
