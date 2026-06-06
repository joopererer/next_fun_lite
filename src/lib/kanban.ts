export type KanbanColumnId = 'proposed' | 'recruiting' | 'ended'

export const KANBAN_COLUMNS: KanbanColumnId[] = ['proposed', 'recruiting', 'ended']

export const KANBAN_COLUMN_LABELS: Record<KanbanColumnId, string> = {
  proposed: '💡 提议池',
  recruiting: '🟢 招募中',
  ended: '✅ 已结束',
}
