import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Link } from 'react-router-dom'
import type { ActivityWithCount } from '../../../shared/types'
import {
  getAllowedTransitions,
  getTransitionLabel,
  isEndedCancelled,
  isEndedSuccess,
  isTerminalStatus,
} from '../../lib/activityStatus'
import type { KanbanColumnId } from '../../lib/kanban'
import { getEventUrl } from '../../lib/api'
import { formatEventDate, formatRelativeTime } from '../../lib/user'
import { CapacityBar } from '../CapacityBar'
import { RecapModal } from './RecapModal'

interface Props {
  activity: ActivityWithCount
  column: KanbanColumnId
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: ActivityWithCount['status']) => void
  onRequestEnd: (activity: ActivityWithCount) => void
  onRequestCancel: (activity: ActivityWithCount) => void
  onRefresh?: () => void
}

export function KanbanCard({
  activity,
  column,
  onDelete,
  onStatusChange,
  onRequestEnd,
  onRequestCancel,
  onRefresh,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: activity.id,
    data: { column, activity },
  })

  const style = { transform: CSS.Translate.toString(transform) }

  const copyLink = () => {
    navigator.clipboard.writeText(getEventUrl(activity.id))
    alert('链接已复制')
  }

  const handleTransitionSelect = (value: string) => {
    if (value === activity.status || !value) return
    if (value === 'ended_success') {
      onRequestEnd(activity)
      return
    }
    if (value === 'ended_cancelled') {
      onRequestCancel(activity)
      return
    }
    if (value === 'recruiting' && activity.status === 'proposed') {
      alert('请使用「转为招募 →」创建独立招募活动')
      return
    }
    onStatusChange(activity.id, value as ActivityWithCount['status'])
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

  const transitions = getAllowedTransitions(activity.status)
  const terminal = isTerminalStatus(activity.status)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-xl p-3 shadow-sm border mb-3 ${
        isEndedCancelled(activity.status) ? 'border-red-200' : 'border-gray-100'
      }`}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <h4 className="font-medium text-sm mb-1">{activity.title}</h4>
        {isEndedCancelled(activity.status) && (
          <p className="text-xs text-red-600 mb-1">❌ 已取消</p>
        )}
        {column === 'proposed' ? (
          <>
            <p className="text-xs text-gray-400 mb-2">
              {activity.organizerName || '匿名'} · {formatRelativeTime(activity.createdAt)}
            </p>
            <p className="text-xs text-green-600 mb-2">
              ❤️ {activity.interestedCount}人感兴趣 {activity.interestedCount >= 5 ? '🔥' : ''}
            </p>
            {(!activity.date || !activity.location) && (
              <p className="text-xs text-amber-600 mb-1">⚠️ 缺时间/地点，不可直接拖入招募中</p>
            )}
          </>
        ) : column === 'recruiting' ? (
          <>
            <p className="text-xs text-gray-400 mb-2">
              {formatEventDate(activity.date)} · {activity.location || '—'}
            </p>
            <CapacityBar current={activity.registeredCount} max={activity.maxParticipants} />
          </>
        ) : (
          <p className="text-xs text-gray-400 mb-2">
            {formatEventDate(activity.date)} · {activity.location || '—'}
          </p>
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
            {isEndedSuccess(activity.status) && (
              <RecapModal activity={activity} onSaved={onRefresh} />
            )}
          </>
        )}
        {!terminal && transitions.length > 0 && (
          <select
            className="text-xs px-1 py-1 border border-gray-200 rounded-lg"
            value={activity.status}
            onChange={(e) => handleTransitionSelect(e.target.value)}
          >
            <option value={activity.status}>状态</option>
            {transitions.map((t) => (
              <option
                key={t}
                value={t}
                className={t === 'ended_cancelled' ? 'text-red-600' : undefined}
              >
                {getTransitionLabel(t)}
              </option>
            ))}
          </select>
        )}
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
