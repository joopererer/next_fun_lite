import { Link } from 'react-router-dom'
import type { ActivityWithCount, Registration } from '../../shared/types'
import { getCancelReasonLabel, isEndedCancelled } from '../lib/activityStatus'
import { getCategoryEmoji, getCategoryLabel } from '../lib/categories'
import { formatEventDate } from '../lib/user'

interface Props {
  activity: ActivityWithCount
  registration?: Registration | null
}

export function MyRegistrationCard({ activity, registration }: Props) {
  if (isEndedCancelled(activity.status)) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-red-200 border-l-4 border-l-red-500">
        <p className="text-sm text-red-600 font-medium mb-2">❌ 活动已取消</p>
        <h3 className="font-semibold text-base mb-2">{activity.title}</h3>
        <p className="text-sm text-gray-600 mb-1">
          原因：{getCancelReasonLabel(activity.cancelReason)}
        </p>
        {activity.cancelNote && (
          <p className="text-sm text-gray-500 mb-2 whitespace-pre-wrap">{activity.cancelNote}</p>
        )}
        <p className="text-xs text-gray-500 mb-3">
          如有疑问联系：{activity.organizerWechat}
        </p>
        <Link to={`/event/${activity.id}`} className="text-sm text-green-600 hover:underline">
          查看详情
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full inline-block mb-2">
        {getCategoryEmoji(activity.category)} {getCategoryLabel(activity.category)}
      </span>
      <h3 className="font-semibold text-base mb-2">{activity.title}</h3>
      <p className="text-sm text-gray-500 mb-1">📅 {formatEventDate(activity.date)}</p>
      <p className="text-sm text-gray-500 mb-1">📍 {activity.location || '地点待定'}</p>
      <p className="text-sm text-gray-500 mb-2">👤 {activity.organizerName} 发起</p>
      {registration && (
        <p className="text-sm text-green-700 mb-3">你的报名：{registration.participantCount}人</p>
      )}
      <Link to={`/event/${activity.id}`} className="text-sm text-green-600 hover:underline">
        查看详情
      </Link>
    </div>
  )
}
