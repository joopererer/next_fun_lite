import { Link } from 'react-router-dom'
import type { ActivityWithCount } from '../../shared/types'
import { formatEventDate } from '../lib/user'
import { CapacityBar } from './CapacityBar'

interface Props {
  activity: ActivityWithCount
}

export function ActivityCard({ activity }: Props) {
  const full = activity.maxParticipants !== null && activity.registeredCount >= activity.maxParticipants

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 card-hover min-w-[260px] flex flex-col">
      <h3 className="font-semibold text-base mb-1">🏃 {activity.title}</h3>
      <p className="text-sm text-gray-500 mb-3">
        {formatEventDate(activity.date)} · {activity.location || '地点待定'}
      </p>
      <div className="mb-3">
        <CapacityBar current={activity.registeredCount} max={activity.maxParticipants} />
      </div>
      {activity.fee && (
        <p className="text-sm text-gray-600 mb-1">💰 {activity.fee}</p>
      )}
      <p className="text-sm text-gray-500 mb-4">👤 {activity.organizerName || '管理员'} 发起</p>
      <Link
        to={`/event/${activity.id}`}
        className={`mt-auto text-center rounded-xl py-2.5 font-medium transition-colors ${
          full ? 'bg-gray-100 text-gray-400 pointer-events-none' : 'btn-primary block'
        }`}
      >
        {full ? '名额已满' : '我要报名'}
      </Link>
    </div>
  )
}
