'use client'

import { useState } from 'react'
import type { ActivityCategory, ActivityWithCount } from '@/shared/types'
import { ActivityCard } from '@/src/components/ActivityCard'
import { CategoryFilter, matchesCategoryFilter } from '@/src/components/CategoryFilter'
import { useHomeRegistration } from './HomeRegistrationContext'

interface Props {
  activities: ActivityWithCount[]
}

export function RecruitingSectionClient({ activities }: Props) {
  const [filter, setFilter] = useState<ActivityCategory[]>([])
  const { registeredIds, markRegistered } = useHomeRegistration()

  const filtered = activities.filter((a) => matchesCategoryFilter(a.category, filter))

  return (
    <section className="mb-10">
      <h2 className="section-title">
        🟢 正在招募
        <span className="text-base font-normal text-gray-400 ml-2">({filtered.length})</span>
      </h2>
      <div className="mb-3">
        <CategoryFilter selected={filter} onChange={setFilter} />
      </div>
      {filtered.length === 0 ? (
        <p className="text-gray-400 text-sm">
          {filter.length > 0 ? '暂无该类型活动' : '暂无招募中的活动'}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
