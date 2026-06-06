import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ActivityWithCount, ActivityStatus } from '../../../shared/types'
import { getStatusLabel, isEndedCancelled, isTerminalStatus } from '../../lib/activityStatus'
import { getCategoryLabel } from '../../lib/categories'
import { formatListDate } from '../../lib/user'

type SortField = 'title' | 'status' | 'date' | 'location' | 'category' | 'registeredCount' | 'createdAt'
type SortDir = 'asc' | 'desc'

type StatusFilter = ActivityStatus | 'all'

interface Props {
  activities: ActivityWithCount[]
  statusFilter: StatusFilter
  onStatusFilterChange: (s: StatusFilter) => void
  onDelete: (id: string) => void
  onRequestCancel: (activity: ActivityWithCount) => void
}

const FILTER_OPTIONS: StatusFilter[] = [
  'all',
  'proposed',
  'recruiting',
  'ended_success',
  'ended_cancelled',
]

export function ActivityListTable({
  activities,
  statusFilter,
  onStatusFilterChange,
  onDelete,
  onRequestCancel,
}: Props) {
  const [query, setQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    else {
      setSortField(field)
      setSortDir(field === 'title' || field === 'location' ? 'asc' : 'desc')
    }
  }

  const sortIndicator = (field: SortField) => {
    if (sortField !== field) return '↕'
    return sortDir === 'asc' ? '↑' : '↓'
  }

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = statusFilter === 'all' ? activities : activities.filter((a) => a.status === statusFilter)
    if (q) {
      list = list.filter((a) =>
        [a.title, a.location, a.organizerName, getCategoryLabel(a.category)]
          .join(' ')
          .toLowerCase()
          .includes(q)
      )
    }
    return [...list].sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case 'title':
          cmp = a.title.localeCompare(b.title, 'zh-CN')
          break
        case 'status':
          cmp = a.status.localeCompare(b.status)
          break
        case 'date': {
          const da = a.date ? new Date(a.date).getTime() : 0
          const db = b.date ? new Date(b.date).getTime() : 0
          cmp = da - db
          break
        }
        case 'location':
          cmp = (a.location || '').localeCompare(b.location || '', 'zh-CN')
          break
        case 'category':
          cmp = getCategoryLabel(a.category).localeCompare(getCategoryLabel(b.category), 'zh-CN')
          break
        case 'registeredCount':
          cmp = a.registeredCount - b.registeredCount
          break
        case 'createdAt':
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [activities, statusFilter, query, sortField, sortDir])

  const thClass = 'py-2 pr-4 cursor-pointer select-none hover:text-green-700 whitespace-nowrap'

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          className="input-field flex-1"
          placeholder="搜索标题、地点、发起人、类型..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="flex gap-2 flex-wrap">
          {FILTER_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              className={`text-sm px-3 py-1.5 rounded-lg ${
                statusFilter === s ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
              onClick={() => onStatusFilterChange(s)}
            >
              {s === 'all' ? '全部' : getStatusLabel(s)}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-2">共 {rows.length} 条 · 点击表头排序</p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className={thClass} onClick={() => toggleSort('title')}>标题 {sortIndicator('title')}</th>
              <th className={thClass} onClick={() => toggleSort('category')}>类型 {sortIndicator('category')}</th>
              <th className={thClass} onClick={() => toggleSort('status')}>状态 {sortIndicator('status')}</th>
              <th className={thClass} onClick={() => toggleSort('date')}>时间 {sortIndicator('date')}</th>
              <th className={thClass} onClick={() => toggleSort('location')}>地点 {sortIndicator('location')}</th>
              <th className={thClass} onClick={() => toggleSort('registeredCount')}>报名 {sortIndicator('registeredCount')}</th>
              <th className="py-2">操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-400">没有匹配的活动</td>
              </tr>
            ) : rows.map((a) => (
              <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 pr-4 font-medium">{a.title}</td>
                <td className="py-3 pr-4">{getCategoryLabel(a.category)}</td>
                <td className={`py-3 pr-4 ${isEndedCancelled(a.status) ? 'text-red-600' : ''}`}>
                  {isEndedCancelled(a.status) ? '❌ ' : ''}{getStatusLabel(a.status)}
                </td>
                <td className="py-3 pr-4">{formatListDate(a.date)}</td>
                <td className="py-3 pr-4">{a.location || '-'}</td>
                <td className="py-3 pr-4">
                  {a.status === 'recruiting'
                    ? `${a.registeredCount}${a.maxParticipants ? `/${a.maxParticipants}` : ''}`
                    : a.status === 'proposed' ? `${a.interestedCount} 感兴趣` : '-'}
                </td>
                <td className="py-3 whitespace-nowrap">
                  <Link to={`/admin/activity/${a.id}`} className="text-green-600 hover:underline mr-2">
                    详情
                  </Link>
                  {!isTerminalStatus(a.status) && (
                    <Link to={`/admin?tab=create&edit=${a.id}`} className="text-green-600 hover:underline mr-2">
                      编辑
                    </Link>
                  )}
                  {(a.status === 'recruiting' || a.status === 'proposed') && (
                    <button
                      type="button"
                      className="text-red-500 hover:underline mr-2"
                      onClick={() => onRequestCancel(a)}
                    >
                      取消
                    </button>
                  )}
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
