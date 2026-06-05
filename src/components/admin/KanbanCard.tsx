import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Link } from 'react-router-dom'
import type { ActivityWithCount } from '../../../shared/types'
import { RecapModal } from './RecapModal'
import { CapacityBar } from '../CapacityBar'
import { formatEventDate, formatRelativeTime } from '../../lib/user'
import { getEventUrl } from '../../lib/api'

interface Props {
  activity: ActivityWithCount
  column: string
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: ActivityWithCount['status']) => void
  onRefresh?: () => void
}

export function KanbanCard({ activity, column, onDelete, onStatusChange, onRefresh }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: activity.id,
    data: { column, activity },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
  }

  const copyLink = () => {
    navigator.clipboard.writeText(getEventUrl(activity.id))
    alert('链接已复制')
  }

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-0 overflow-hidden opacity-0 pointer-events-none mb-0"
        aria-hidden
      />
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 mb-3"
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <h4 className="font-medium text-sm mb-1">{activity.title}</h4>
        {column === 'proposed' ? (
          <>
            <p className="text-xs text-gray-400 mb-2">
              {activity.organizerName || '匿名'} · {formatRelativeTime(activity.createdAt)}
            </p>
            <p className="text-xs text-green-600 mb-2">
              ❤️ {activity.interestedCount}人感兴趣 {activity.interestedCount >= 5 ? '🔥' : ''}
            </p>
            {(!activity.date || !activity.location || activity.maxParticipants == null) && (
              <p className="text-xs text-amber-600 mb-1">⚠️ 缺时间/地点/人数，不可直接拖入招募中</p>
            )}
          </>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-2">
              {formatEventDate(activity.date)} · {activity.location || '—'}
            </p>
            <CapacityBar current={activity.registeredCount} max={activity.maxParticipants} />
          </>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {column === 'proposed' && (
          <>
            <Link to={`/admin/activity/${activity.id}`} className="text-xs px-2 py-1 bg-gray-100 rounded-lg hover:bg-gray-200">
              查看详情
            </Link>
            <Link
              to={`/recruit/new?from=${activity.id}`}
              className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
            >
              转为招募 →
            </Link>
          </>
        )}
        {column === 'recruiting' && (
          <>
            <Link to={`/admin/activity/${activity.id}`} className="text-xs px-2 py-1 bg-gray-100 rounded-lg hover:bg-gray-200">
              报名名单
            </Link>
            <button type="button" className="text-xs px-2 py-1 bg-gray-100 rounded-lg hover:bg-gray-200" onClick={copyLink}>
              复制链接
            </button>
          </>
        )}
        {column === 'ended' && (
          <>
            <Link to={`/admin/activity/${activity.id}`} className="text-xs px-2 py-1 bg-gray-100 rounded-lg hover:bg-gray-200">
              查看详情
            </Link>
            <RecapModal activity={activity} onSaved={onRefresh} />
          </>
        )}
        <select
          className="text-xs px-1 py-1 border border-gray-200 rounded-lg"
          value={activity.status}
          onChange={(e) => onStatusChange(activity.id, e.target.value as ActivityWithCount['status'])}
        >
          <option value="proposed">提议池</option>
          <option value="recruiting">招募中</option>
          <option value="ended">已结束</option>
        </select>
        <button
          type="button"
          className="text-xs px-2 py-1 text-red-500 hover:bg-red-50 rounded-lg ml-auto"
          onClick={() => {
            if (confirm('确定删除？')) onDelete(activity.id)
          }}
        >
          删除
        </button>
      </div>
    </div>
  )
}
