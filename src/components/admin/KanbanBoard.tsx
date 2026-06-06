'use client'

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useState } from 'react'
import type { ActivityWithCount } from '../../../shared/types'
import { isEndedColumnStatus } from '../../lib/activityStatus'
import { KANBAN_COLUMNS, type KanbanColumnId } from '../../lib/kanban'
import { KanbanColumn } from './KanbanColumn'
import { KanbanCard } from './KanbanCard'

function resolveDropColumn(
  overId: string | number,
  overData: Record<string, unknown> | undefined,
  activities: ActivityWithCount[],
): KanbanColumnId | null {
  const id = String(overId)
  if (KANBAN_COLUMNS.includes(id as KanbanColumnId)) return id as KanbanColumnId
  const overActivity = activities.find((a) => a.id === id)
  if (overActivity) {
    if (isEndedColumnStatus(overActivity.status)) return 'ended'
    return overActivity.status as KanbanColumnId
  }
  const column = overData?.column as KanbanColumnId | undefined
  if (column && KANBAN_COLUMNS.includes(column)) return column
  return null
}

interface Props {
  activities: ActivityWithCount[]
  onStatusChange: (id: string, status: ActivityWithCount['status']) => void
  onRequestEnd: (activity: ActivityWithCount) => void
  onRequestCancel: (activity: ActivityWithCount) => void
  onDelete: (id: string) => void
  onRefresh?: () => void
}

export function KanbanBoard({
  activities,
  onStatusChange,
  onRequestEnd,
  onRequestCancel,
  onDelete,
  onRefresh,
}: Props) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  )

  const byColumn = (column: KanbanColumnId) => {
    if (column === 'ended') {
      return activities.filter((a) => isEndedColumnStatus(a.status))
    }
    return activities.filter((a) => a.status === column)
  }

  const activeActivity = activeId ? activities.find((a) => a.id === activeId) : null

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over) return

    const targetColumn = resolveDropColumn(
      over.id,
      over.data.current as Record<string, unknown> | undefined,
      activities,
    )
    const activity = activities.find((a) => a.id === active.id)
    if (!activity || !targetColumn) return

    const currentColumn: KanbanColumnId = isEndedColumnStatus(activity.status)
      ? 'ended'
      : (activity.status as KanbanColumnId)

    if (currentColumn === targetColumn) return

    if (targetColumn === 'ended') {
      if (activity.status === 'recruiting') onRequestEnd(activity)
      else if (activity.status === 'proposed') onRequestCancel(activity)
      return
    }

    if (targetColumn === 'recruiting' && activity.status === 'proposed') {
      alert('请使用「转为招募 →」创建独立招募活动，不能直接拖入招募中。')
      return
    }

    if (targetColumn === 'proposed' && activity.status === 'recruiting') {
      onStatusChange(activity.id, 'proposed')
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={(args) => {
        const pointer = pointerWithin(args)
        if (pointer.length > 0) return pointer
        return rectIntersection(args)
      }}
      onDragStart={(e: DragStartEvent) => setActiveId(e.active.id as string)}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map((column) => (
          <KanbanColumn
            key={column}
            column={column}
            activities={byColumn(column)}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
            onRequestEnd={onRequestEnd}
            onRequestCancel={onRequestCancel}
            onRefresh={onRefresh}
          />
        ))}
      </div>
      <DragOverlay>
        {activeActivity && (
          <div className="opacity-90 rotate-2 shadow-xl">
            <KanbanCard
              activity={activeActivity}
              column={isEndedColumnStatus(activeActivity.status) ? 'ended' : activeActivity.status as KanbanColumnId}
              onDelete={() => {}}
              onStatusChange={() => {}}
              onRequestEnd={() => {}}
              onRequestCancel={() => {}}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
