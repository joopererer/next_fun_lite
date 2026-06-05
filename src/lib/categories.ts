import type { ActivityCategory } from '../../shared/types'

export const ACTIVITY_CATEGORIES: { value: ActivityCategory; label: string; emoji: string }[] = [
  { value: 'board_game', label: '桌游', emoji: '🎲' },
  { value: 'sports', label: '运动', emoji: '🏃' },
  { value: 'culture', label: '文化', emoji: '🎨' },
  { value: 'dining', label: '聚餐', emoji: '🍜' },
  { value: 'escape_room', label: '密室', emoji: '🔐' },
  { value: 'other', label: '其他', emoji: '✨' },
]

export function getCategoryLabel(category: ActivityCategory | undefined): string {
  return ACTIVITY_CATEGORIES.find((c) => c.value === category)?.label ?? '其他'
}

export function getCategoryEmoji(category: ActivityCategory | undefined): string {
  return ACTIVITY_CATEGORIES.find((c) => c.value === category)?.emoji ?? '✨'
}
