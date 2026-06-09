'use client'

import { useCallback, useMemo, useState } from 'react'
import type { ActivityStatus, ActivityWithCount } from '../../../shared/types'
import { isInfoPost, isProposalPost } from '../../../shared/infoVisibility'
import { buildExportFilename, buildExportMatrix } from '../../../shared/excelExport'
import { api } from '../../lib/api'
import { getStatusLabel } from '../../lib/activityStatus'
import { getCategoryLabel } from '../../lib/categories'
import { formatListDate } from '../../lib/user'

interface Props {
  activities: ActivityWithCount[]
}

type StatusFilter = ActivityStatus | 'all' | 'info'

const FILTER_OPTIONS: StatusFilter[] = [
  'all',
  'info',
  'proposed',
  'recruiting',
  'ended_success',
  'ended_cancelled',
]

function getFilterLabel(s: StatusFilter): string {
  if (s === 'all') return '全部'
  if (s === 'info') return '资讯'
  return getStatusLabel(s)
}

export function ExportTab({ activities }: Props) {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [includeInfo, setIncludeInfo] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [exporting, setExporting] = useState(false)

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = activities
    if (statusFilter === 'info') list = activities.filter((a) => isInfoPost(a))
    else if (statusFilter === 'proposed') list = activities.filter((a) => isProposalPost(a))
    else if (statusFilter === 'all') {
      list = includeInfo ? activities : activities.filter((a) => !isInfoPost(a))
    } else {
      list = activities.filter((a) => a.status === statusFilter && !isInfoPost(a))
    }
    if (q) {
      list = list.filter((a) =>
        [a.title, a.location, a.organizerName, getCategoryLabel(a.category)]
          .join(' ')
          .toLowerCase()
          .includes(q),
      )
    }
    return list
  }, [activities, statusFilter, query, includeInfo])

  const allVisibleSelected = rows.length > 0 && rows.every((a) => selected.has(a.id))
  const someVisibleSelected = rows.some((a) => selected.has(a.id))

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAllVisible = () => {
    if (allVisibleSelected) {
      setSelected((prev) => {
        const next = new Set(prev)
        for (const a of rows) next.delete(a.id)
        return next
      })
    } else {
      setSelected((prev) => {
        const next = new Set(prev)
        for (const a of rows) next.add(a.id)
        return next
      })
    }
  }

  const handleExport = useCallback(async () => {
    const ids = [...selected]
    if (ids.length === 0) return

    setExporting(true)
    try {
      const selectedActivities = activities.filter((a) => ids.includes(a.id))
      const registrationResults = await Promise.all(
        selectedActivities.map(async (activity) => {
          try {
            const regs = await api.getRegistrations(activity.id)
            const active = regs.filter((r) => !r.cancelledAt)
            const memberNames = active.map((r) => r.name)
            const headcount = active.reduce((sum, r) => sum + (r.participantCount || 1), 0)
            return { activity, memberNames, headcount }
          } catch {
            return {
              activity,
              memberNames: [] as string[],
              headcount: activity.registeredCount ?? 0,
            }
          }
        }),
      )

      const mod = await import('xlsx')
      const XLSX = mod.default ?? mod
      const matrix = buildExportMatrix(registrationResults)
      const ws = XLSX.utils.aoa_to_sheet(matrix)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, '活动')
      XLSX.writeFile(wb, buildExportFilename())
    } catch (err) {
      alert(err instanceof Error ? err.message : '导出失败')
    } finally {
      setExporting(false)
    }
  }, [selected, activities])

  return (
    <div>
      <h3 className="font-semibold mb-2">📤 导出活动数据</h3>
      <p className="text-sm text-gray-500 mb-4">
        勾选需要导出的活动，生成与导入格式兼容的 .xlsx 文件（含报名名单）。
      </p>

      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        <input
          className="input-field flex-1 min-w-0"
          placeholder="搜索标题、地点、发起人、类型..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="flex gap-2 flex-wrap shrink-0">
          {FILTER_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              className={`text-sm px-3 py-1.5 rounded-lg ${
                statusFilter === s ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
              onClick={() => setStatusFilter(s)}
            >
              {getFilterLabel(s)}
            </button>
          ))}
        </div>
      </div>

      {statusFilter === 'all' && (
        <label className="flex items-center gap-2 text-sm text-gray-600 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={includeInfo}
            onChange={(e) => setIncludeInfo(e.target.checked)}
            className="rounded border-gray-300"
          />
          包含资讯帖（资讯字段可能不完整）
        </label>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button type="button" className="text-sm text-green-600 hover:underline" onClick={toggleAllVisible}>
          {allVisibleSelected ? '取消全选' : '全选当前列表'}
        </button>
        <span className="text-sm text-gray-500">
          已选 {selected.size} 条 · 当前列表 {rows.length} 条
        </span>
        <button
          type="button"
          className="btn-primary ml-auto"
          disabled={exporting || selected.size === 0}
          onClick={handleExport}
        >
          {exporting ? '导出中...' : `导出 ${selected.size > 0 ? selected.size : ''} 条`.trim()}
        </button>
      </div>

      <div className="overflow-x-auto border rounded-xl">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-gray-500">
              <th className="p-3 w-10">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someVisibleSelected && !allVisibleSelected
                  }}
                  onChange={toggleAllVisible}
                  aria-label="全选"
                />
              </th>
              <th className="p-3 min-w-[140px]">标题</th>
              <th className="p-3">类型</th>
              <th className="p-3">状态</th>
              <th className="p-3 min-w-[100px]">时间</th>
              <th className="p-3">地点</th>
              <th className="p-3">报名</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-400">
                  没有匹配的活动
                </td>
              </tr>
            ) : (
              rows.map((a) => (
                <tr
                  key={a.id}
                  className={`border-b border-gray-50 cursor-pointer hover:bg-gray-50/80 ${
                    selected.has(a.id) ? 'bg-green-50/50' : ''
                  }`}
                  onClick={() => toggleOne(a.id)}
                >
                  <td className="p-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected.has(a.id)}
                      onChange={() => toggleOne(a.id)}
                      aria-label={`选择 ${a.title}`}
                    />
                  </td>
                  <td className="p-3 font-medium">{a.title}</td>
                  <td className="p-3">{getCategoryLabel(a.category)}</td>
                  <td className="p-3">
                    {isInfoPost(a) ? '📢 资讯' : getStatusLabel(a.status)}
                  </td>
                  <td className="p-3 whitespace-nowrap">{formatListDate(a.date)}</td>
                  <td className="p-3">{a.location || '—'}</td>
                  <td className="p-3 whitespace-nowrap">
                    {a.status === 'recruiting'
                      ? `${a.registeredCount}${a.maxParticipants ? `/${a.maxParticipants}` : ''}`
                      : a.status === 'proposed'
                        ? `${a.interestedCount} 感兴趣`
                        : a.registeredCount > 0
                          ? `${a.registeredCount}人`
                          : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ul className="text-sm text-gray-500 space-y-1 list-disc pl-5 mt-6">
        <li>列格式与导入模板一致，可编辑后重新导入</li>
        <li>重新导入时相同标题+日期的活动会被跳过（不覆盖）</li>
        <li>资讯帖默认不在列表中，可在「全部」筛选下勾选包含</li>
      </ul>
    </div>
  )
}
