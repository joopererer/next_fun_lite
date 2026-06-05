import { Link } from 'react-router-dom'
import type { ActivityWithCount } from '../../shared/types'
import { getCategoryEmoji, getCategoryLabel } from '../lib/categories'
import { formatEventDate } from '../lib/user'
import { CapacityBar } from './CapacityBar'

interface Props {
  activity: ActivityWithCount
  registered?: boolean
}

export function ActivityCard({ activity, registered = false }: Props) {
  const full = !registered && activity.maxParticipants !== null && activity.registeredCount >= activity.maxParticipants

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 card-hover flex flex-col h-full">
      <Link to={`/event/${activity.id}`} className="block flex-1 group">
        <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full inline-block mb-2">
          {getCategoryEmoji(activity.category)} {getCategoryLabel(activity.category)}
        </span>
        <h3 className="font-semibold text-base mb-1 group-hover:text-green-700 transition-colors">
          {activity.title}
        </h3>
        <p className="text-sm text-gray-500 mb-2">
          {formatEventDate(activity.date)} · {activity.location || '地点待定'}
        </p>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{activity.description}</p>
        <div className="mb-3">
          <CapacityBar current={activity.registeredCount} max={activity.maxParticipants} />
        </div>
        {activity.fee && (
          <p className="text-sm text-gray-600 mb-1">💰 {activity.fee}</p>
        )}
        <p className="text-sm text-gray-500 mb-2">👤 {activity.organizerName || '管理员'} 发起</p>
        <p className="text-xs text-green-600 mb-3">点击查看详情 →</p>
      </Link>
      {registered ? (
        <div className="mt-auto text-center rounded-xl py-2.5 font-medium bg-gray-100 text-gray-500 border border-gray-200">
          已报名
        </div>
      ) : (
        <Link
          to={`/event/${activity.id}`}
          className={`mt-auto text-center rounded-xl py-2.5 font-medium transition-colors ${
            full ? 'bg-gray-100 text-gray-400 pointer-events-none' : 'btn-primary block'
          }`}
        >
          {full ? '名额已满' : '我要报名'}
        </Link>
      )}
    </div>
  )
}
