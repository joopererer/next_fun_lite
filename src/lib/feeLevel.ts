import type { FeeLevel } from '../../shared/types'

export const FEE_LEVELS: { value: FeeLevel; label: string; emoji: string }[] = [
  { value: 'free', label: '免费', emoji: '💚' },
  { value: 'low', label: '低消（<20€）', emoji: '💛' },
  { value: 'paid', label: '需购票', emoji: '🎫' },
  { value: 'unknown', label: '不确定', emoji: '❓' },
]

export function getFeeLevelLabel(level: FeeLevel | undefined): string {
  return FEE_LEVELS.find((f) => f.value === level)?.label ?? '不确定'
}

export function getFeeLevelEmoji(level: FeeLevel | undefined): string {
  return FEE_LEVELS.find((f) => f.value === level)?.emoji ?? '❓'
}
