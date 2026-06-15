'use client'

import { useMemo, useState } from 'react'
import type { ActivityCategory, ActivityWithCount } from '@/shared/types'
import { ACTIVITY_CATEGORIES } from '@/src/lib/categories'
import { ActivityCard } from '@/src/components/ActivityCard'
import { CategoryFilter, matchesCategoryFilter } from '@/src/components/CategoryFilter'
import { useT } from '@/src/i18n/LanguageContext'
import { useHomeRegistration } from './HomeRegistrationContext'

interface Props {
  activities: ActivityWithCount[]
}

export function RecruitingSectionClient({ activities }: Props) {
  const [filter, setFilter] = useState<ActivityCategory[]>([])
  const { registeredIds, markRegistered } = useHomeRegistration()
  const t = useT()

  const counts = useMemo(
    () =>
      Object.fromEntries(
        ACTIVITY_CATEGORIES.map((c) => [
          c.value,
          activities.filter((a) => a.category === c.value).length,
        ]),
      ) as Partial<Record<ActivityCategory, number>>,
    [activities],
  )

  const filtered = activities.filter((a) => matchesCategoryFilter(a.category, filter))

  return (
    <section className="mb-8 sm:mb-10">
      <h2 className="section-title">
        {t.sectionRecruiting}
        <span className="text-base font-normal text-gray-400 ml-2">({filtered.length})</span>
      </h2>
      <div className="mb-3">
        <CategoryFilter selected={filter} onChange={setFilter} counts={counts} totalCount={activities.length} />
      </div>
      {filtered.length === 0 ? (
        <p className="text-gray-400 text-sm">
          {filter.length > 0 ? t.noRecruitingFilter : t.noRecruiting}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
          {filtered.map((a) => (
            <ActivityCard
              key={a.id}
              activity={a}
              registered={registeredIds.has(a.id)}
              onRegistered={markRegistered}
            />
          ))}
        </div>
      )}
    </section>
  )
}
