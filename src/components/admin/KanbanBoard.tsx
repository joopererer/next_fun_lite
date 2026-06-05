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
import type { ActivityWithCount, ActivityStatus } from '../../../shared/types'
import { KanbanColumn } from './KanbanColumn'
import { KanbanCard } from './KanbanCard'

const COLUMNS: ActivityStatus[] = ['proposed', 'recruiting', 'ended']

function resolveDropStatus(
  overId: string | number,
  overData: Record<string, unknown> | undefined,
  activities: ActivityWithCount[],
): ActivityStatus | null {
  const id = String(overId)
  if (COLUMNS.includes(id as ActivityStatus)) return id as ActivityStatus
  const overActivity = activities.find((a) => a.id === id)
  if (overActivity) return overActivity.status
  const column = overData?.column as ActivityStatus | undefined
  if (column && COLUMNS.includes(column)) return column
  return null
}

interface Props {
  activities: ActivityWithCount[]
  onStatusChange: (id: string, status: ActivityStatus) => void
  onDelete: (id: string) => void
  onRefresh?: () => void
}

export function KanbanBoard({ activities, onStatusChange, onDelete, onRefresh }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  )

  const byStatus = (status: ActivityStatus) =>
    activities.filter((a) => a.status === status)

  const activeActivity = activeId ? activities.find((a) => a.id === activeId) : null

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over) return

    const newStatus = resolveDropStatus(over.id, over.data.current as Record<string, unknown> | undefined, activities)
    const activity = activities.find((a) => a.id === active.id)
    if (activity && newStatus && activity.status !== newStatus) {
      onStatusChange(activity.id, newStatus)
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
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            activities={byStatus(status)}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
            onRefresh={onRefresh}
          />
        ))}
      </div>
      <DragOverlay>
        {activeActivity && (
          <div className="opacity-90 rotate-2 shadow-xl">
            <KanbanCard
              activity={activeActivity}
              column={activeActivity.status}
              onDelete={() => {}}
              onStatusChange={() => {}}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
