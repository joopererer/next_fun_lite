import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { ActivityWithCount, ActivityStatus } from '../../../shared/types'
import { KanbanCard } from './KanbanCard'

const COLUMN_LABELS: Record<ActivityStatus, string> = {
  proposed: '💡 提议池',
  recruiting: '🟢 招募中',
  ended: '✅ 已结束',
}

interface Props {
  status: ActivityStatus
  activities: ActivityWithCount[]
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: ActivityStatus) => void
  onRefresh?: () => void
}

export function KanbanColumn({ status, activities, onDelete, onStatusChange, onRefresh }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[240px] bg-gray-50 rounded-2xl p-3 transition-colors ${
        isOver ? 'bg-green-50 ring-2 ring-green-300' : ''
      }`}
    >
      <div className="flex items-center gap-2 mb-3 px-1">
        <h3 className="font-semibold text-sm">{COLUMN_LABELS[status]}</h3>
        <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">
          {activities.length}
        </span>
      </div>
      <SortableContext items={activities.map((a) => a.id)} strategy={verticalListSortingStrategy}>
        {activities.map((a) => (
          <KanbanCard
            key={a.id}
            activity={a}
            column={status}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
            onRefresh={onRefresh}
          />
        ))}
      </SortableContext>
    </div>
  )
}
