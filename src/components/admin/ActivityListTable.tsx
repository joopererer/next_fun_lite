import { Link } from 'react-router-dom'
import type { ActivityWithCount, ActivityStatus } from '../../../shared/types'
import { formatEventDate } from '../../lib/user'

interface Props {
  activities: ActivityWithCount[]
  statusFilter: ActivityStatus | 'all'
  onStatusFilterChange: (s: ActivityStatus | 'all') => void
  onDelete: (id: string) => void
}

export function ActivityListTable({ activities, statusFilter, onStatusFilterChange, onDelete }: Props) {
  const filtered = statusFilter === 'all'
    ? activities
    : activities.filter((a) => a.status === statusFilter)

  const sorted = [...filtered].sort((a, b) => {
    const da = a.date ? new Date(a.date).getTime() : 0
    const db = b.date ? new Date(b.date).getTime() : 0
    return db - da
  })

  const statusLabel = (s: ActivityStatus) =>
    s === 'proposed' ? '提议池' : s === 'recruiting' ? '招募中' : '已结束'

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {(['all', 'proposed', 'recruiting', 'ended'] as const).map((s) => (
          <button
            key={s}
            type="button"
            className={`text-sm px-3 py-1.5 rounded-lg ${
              statusFilter === s ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
            onClick={() => onStatusFilterChange(s)}
          >
            {s === 'all' ? '全部' : statusLabel(s)}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="py-2 pr-4">标题</th>
              <th className="py-2 pr-4">状态</th>
              <th className="py-2 pr-4">时间</th>
              <th className="py-2 pr-4">地点</th>
              <th className="py-2 pr-4">报名</th>
              <th className="py-2">操作</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((a) => (
              <tr key={a.id} className="border-b border-gray-100">
                <td className="py-3 pr-4 font-medium">{a.title}</td>
                <td className="py-3 pr-4">{statusLabel(a.status)}</td>
                <td className="py-3 pr-4">{formatEventDate(a.date)}</td>
                <td className="py-3 pr-4">{a.location || '-'}</td>
                <td className="py-3 pr-4">
                  {a.status === 'recruiting'
                    ? `${a.registeredCount}${a.maxParticipants ? `/${a.maxParticipants}` : ''}`
                    : '-'}
                </td>
                <td className="py-3">
                  <Link to={`/admin/activity/${a.id}`} className="text-green-600 hover:underline mr-2">
                    详情
                  </Link>
                  <button
                    type="button"
                    className="text-red-500 hover:underline"
                    onClick={() => confirm('确定删除？') && onDelete(a.id)}
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
