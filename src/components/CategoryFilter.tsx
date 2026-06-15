'use client'

import type { ActivityCategory } from '../../shared/types'
import { ACTIVITY_CATEGORIES } from '../lib/categories'
import { useT } from '../i18n/LanguageContext'
import type { Translations } from '../i18n/types'

interface Props {
  selected: ActivityCategory[]
  onChange: (selected: ActivityCategory[]) => void
  counts?: Partial<Record<ActivityCategory, number>>
  totalCount?: number
}

export function getCatLabel(t: Translations, cat: ActivityCategory): string {
  const key = `cat_${cat}` as keyof Translations
  const val = t[key]
  return typeof val === 'string' ? val : cat
}

export function CategoryFilter({ selected, onChange, counts, totalCount }: Props) {
  const t = useT()
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
        {t.allFilter}{totalCount != null ? <span className={`ml-1 text-xs ${allSelected ? 'opacity-80' : 'text-gray-400'}`}>{totalCount}</span> : null}
      </button>
      {ACTIVITY_CATEGORIES.map((c) => {
        const active = selected.includes(c.value)
        const count = counts?.[c.value]
        if (count === 0) return null
        return (
          <button
            key={c.value}
            type="button"
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              active ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => toggle(c.value)}
          >
            {c.emoji} {getCatLabel(t, c.value)}{count != null ? <span className={`ml-1 text-xs ${active ? 'opacity-80' : 'text-gray-400'}`}>{count}</span> : null}
          </button>
        )
      })}
    </div>
  )
}

export function matchesCategoryFilter(category: ActivityCategory, selected: ActivityCategory[]): boolean {
  return selected.length === 0 || selected.includes(category)
}
