'use client'

import { useState } from 'react'
import type { ActivityWithCount } from '@/shared/types'
import { PastActivityCard } from '@/src/components/PastActivityCard'
import { useT } from '@/src/i18n/LanguageContext'

interface Props {
  activities: ActivityWithCount[]
}

export function PastSectionClient({ activities }: Props) {
  const [expanded, setExpanded] = useState(false)
  const t = useT()

  if (activities.length === 0) return null

  return (
    <section>
      <button
        type="button"
        className="flex items-center gap-2 text-left w-full mb-3"
        onClick={() => setExpanded(!expanded)}
      >
        <h2 className="section-title mb-0">
          ✅ {t.sectionPast}
          <span className="text-base font-normal text-gray-400 ml-2">({activities.length})</span>
        </h2>
        <span className="text-sm text-gray-400">{expanded ? '▴' : '▾'}</span>
      </button>
      {expanded && (
        <div className="space-y-3">
          {activities.map((a) => (
            <PastActivityCard key={a.id} activity={a} />
          ))}
        </div>
      )}
    </section>
  )
}
