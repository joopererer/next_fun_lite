import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { Activity, ActivityStatus, ActivityWithCount } from '../../shared/types'
import { ActivityListTable } from '../components/admin/ActivityListTable'
import { AdminGate } from '../components/admin/AdminGate'
import { KanbanBoard } from '../components/admin/KanbanBoard'
import { RecruitForm } from '../components/recruit/RecruitForm'
import { api } from '../lib/api'

type Tab = 'kanban' | 'list' | 'create'

export function AdminPage() {
  const [searchParams] = useSearchParams()
  const initialTab = (searchParams.get('tab') as Tab) || 'kanban'
  const editId = searchParams.get('edit')

  const [tab, setTab] = useState<Tab>(initialTab)
  const [activities, setActivities] = useState<ActivityWithCount[]>([])
  const [statusFilter, setStatusFilter] = useState<ActivityStatus | 'all'>('all')
  const [editActivity, setEditActivity] = useState<ActivityWithCount | null>(null)

  const load = useCallback(() => {
    api.getActivities().then(setActivities).catch(console.error)
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (editId) {
      api.getActivity(editId).then(setEditActivity).catch(console.error)
      setTab('create')
    } else {
      setEditActivity(null)
    }
  }, [editId])

  const isRecruitingReady = (activity: Activity) =>
    Boolean(activity.date && activity.location?.trim())

  const handleStatusChange = async (id: string, status: ActivityStatus) => {
    const activity = activities.find((a) => a.id === id)
    if (status === 'recruiting' && activity && !isRecruitingReady(activity)) {
      alert('转为招募需要填写：活动时间、地点。\n请使用「转为招募 →」链接或编辑活动补充信息，不能直接拖入招募中。')
      return
    }

    const previous = activity?.status
    setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)))
    try {
      await api.updateActivity(id, { status })
    } catch (err) {
      if (previous) {
        setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, status: previous } : a)))
      }
      alert(err instanceof Error ? err.message : '更新失败')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.deleteActivity(id)
      load()
    } catch (err) {
      alert(err instanceof Error ? err.message : '删除失败')
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'kanban', label: '看板视图' },
    { id: 'list', label: '列表视图' },
    { id: 'create', label: editId ? '编辑活动' : '新建活动' },
  ]

  return (
    <AdminGate>
      <div className="min-h-screen pb-12">
        <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-green-700">管理看板</h1>
              <Link to="/" className="text-xs text-gray-400 hover:text-green-600">← 回到首页</Link>
            </div>
          </div>
          <div className="max-w-6xl mx-auto px-4 flex gap-1 border-t border-gray-50">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  tab === t.id
                    ? 'border-green-600 text-green-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-6 page-enter">
          {tab === 'kanban' && (
            <KanbanBoard
              activities={activities}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onRefresh={load}
            />
          )}
          {tab === 'list' && (
            <ActivityListTable
              activities={activities}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              onDelete={handleDelete}
            />
          )}
          {tab === 'create' && (
            <RecruitForm
              mode="admin"
              initial={editActivity ?? undefined}
              editId={editId ?? undefined}
              onSuccess={load}
            />
          )}
        </main>
      </div>
    </AdminGate>
  )
}
