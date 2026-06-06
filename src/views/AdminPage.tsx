'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import type { Activity, ActivityStatus, ActivityWithCount } from '../../shared/types'
import { ActivityListTable } from '../components/admin/ActivityListTable'
import { AdminGate } from '../components/admin/AdminGate'
import { CancelActivityModal } from '../components/admin/CancelActivityModal'
import { EndActivityModal } from '../components/admin/EndActivityModal'
import { KanbanBoard } from '../components/admin/KanbanBoard'
import { RecruitForm } from '../components/recruit/RecruitForm'
import { isTerminalStatus } from '../lib/activityStatus'
import { api } from '../lib/api'
import { Footer } from '../components/layout/Footer'

type Tab = 'kanban' | 'list' | 'create'

export function AdminPage() {
  const searchParams = useSearchParams()
  const initialTab = (searchParams.get('tab') as Tab) || 'kanban'
  const editId = searchParams.get('edit')

  const [tab, setTab] = useState<Tab>(initialTab)
  const [activities, setActivities] = useState<ActivityWithCount[]>([])
  const [statusFilter, setStatusFilter] = useState<ActivityStatus | 'all'>('all')
  const [editActivity, setEditActivity] = useState<ActivityWithCount | null>(null)
  const [endModalActivity, setEndModalActivity] = useState<ActivityWithCount | null>(null)
  const [cancelModalActivity, setCancelModalActivity] = useState<ActivityWithCount | null>(null)

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

  const handleStatusChange = async (id: string, status: ActivityStatus) => {
    const activity = activities.find((a) => a.id === id)
    if (!activity) return

    if (status === 'ended_success') {
      setEndModalActivity(activity)
      return
    }
    if (status === 'ended_cancelled') {
      setCancelModalActivity(activity)
      return
    }
    if (status === 'recruiting' && activity.status === 'proposed') {
      alert('请使用「转为招募 →」创建独立招募活动')
      return
    }
    if (isTerminalStatus(status)) return

    const previous = activity.status
    setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)))
    try {
      await api.updateActivity(id, { status })
    } catch (err) {
      setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, status: previous } : a)))
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
      <div className="min-h-screen flex flex-col pb-12">
        <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-green-700">管理看板</h1>
              <Link href="/" className="text-xs text-gray-400 hover:text-green-600">← 回到首页</Link>
            </div>
          </div>
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex gap-1 border-t border-gray-50 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 ${
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

        <main className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 page-enter">
          {tab === 'kanban' && (
            <KanbanBoard
              activities={activities}
              onStatusChange={handleStatusChange}
              onRequestEnd={setEndModalActivity}
              onRequestCancel={setCancelModalActivity}
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
              onRequestCancel={setCancelModalActivity}
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

        {endModalActivity && (
          <EndActivityModal
            activity={endModalActivity}
            open
            onClose={() => setEndModalActivity(null)}
            onSaved={() => {
              setEndModalActivity(null)
              load()
            }}
          />
        )}
        {cancelModalActivity && (
          <CancelActivityModal
            activity={cancelModalActivity}
            open
            onClose={() => setCancelModalActivity(null)}
            onSaved={() => {
              setCancelModalActivity(null)
              load()
            }}
          />
        )}
        <Footer />
      </div>
    </AdminGate>
  )
}
