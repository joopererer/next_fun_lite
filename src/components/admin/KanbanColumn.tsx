import { useDroppable } from '@dnd-kit/core'
import type { ActivityWithCount } from '../../../shared/types'
import { KANBAN_COLUMN_LABELS, type KanbanColumnId } from '../../lib/kanban'
import { KanbanCard } from './KanbanCard'

interface Props {
  column: KanbanColumnId
  activities: ActivityWithCount[]
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: ActivityWithCount['status']) => void
  onRequestEnd: (activity: ActivityWithCount) => void
  onRequestCancel: (activity: ActivityWithCount) => void
  onRefresh?: () => void
}

export function KanbanColumn({
  column,
  activities,
  onDelete,
  onStatusChange,
  onRequestEnd,
  onRequestCancel,
  onRefresh,
}: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: column })

  return (
    <div
      ref={setNodeRef}
      className={`min-w-0 bg-gray-50 rounded-2xl p-4 lg:p-5 transition-colors flex flex-col min-h-[200px] ${
        isOver ? 'bg-green-50 ring-2 ring-green-300' : ''
      }`}
    >
      <div className="flex items-center gap-2 mb-4 px-1">
        <h3 className="font-semibold text-sm lg:text-base">{KANBAN_COLUMN_LABELS[column]}</h3>
        <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">
          {activities.length}
        </span>
      </div>
      <div className="flex-1 min-h-[120px]">
        {activities.map((a) => (
          <KanbanCard
            key={a.id}
            activity={a}
            column={column}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
            onRequestEnd={onRequestEnd}
            onRequestCancel={onRequestCancel}
            onRefresh={onRefresh}
          />
        ))}
      </div>
    </div>
  )
}
