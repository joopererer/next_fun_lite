import type { ActivityCategory } from '../../shared/types'
import { ACTIVITY_CATEGORIES } from '../lib/categories'

interface Props {
  selected: ActivityCategory[]
  onChange: (selected: ActivityCategory[]) => void
}

export function CategoryFilter({ selected, onChange }: Props) {
  const toggle = (cat: ActivityCategory) => {
    if (selected.includes(cat)) {
      onChange(selected.filter((c) => c !== cat))
    } else {
      onChange([...selected, cat])
    }
  }

  const allSelected = selected.length === 0

  return (
    <div className="flex gap-2 overflow-x-auto flex-nowrap pb-2 -mx-1 px-1 scrollbar-hide">
      <button
        type="button"
        className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
          allSelected ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
        onClick={() => onChange([])}
      >
        全部
      </button>
      {ACTIVITY_CATEGORIES.map((c) => {
        const active = selected.includes(c.value)
        return (
          <button
            key={c.value}
            type="button"
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              active ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => toggle(c.value)}
          >
            {c.emoji} {c.label}
          </button>
        )
      })}
    </div>
  )
}

export function matchesCategoryFilter(category: ActivityCategory, selected: ActivityCategory[]): boolean {
  return selected.length === 0 || selected.includes(category)
}
