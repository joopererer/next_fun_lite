'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { ActivityCategory, ActivityWithCount } from '@/shared/types'
import { CategoryFilter, matchesCategoryFilter } from '@/src/components/CategoryFilter'
import { ProposalCard } from '@/src/components/ProposalCard'
import { sortProposalsForHome } from '@/src/lib/proposals'

interface Props {
  proposedAll: ActivityWithCount[]
}

export function ProposalsSectionClient({ proposedAll }: Props) {
  const [filter, setFilter] = useState<ActivityCategory[]>([])

  const filteredAll = proposedAll.filter((a) => matchesCategoryFilter(a.category, filter))
  const filtered = sortProposalsForHome(filteredAll)
  const proposedOverflow = filteredAll.length > filtered.length

  return (
    <section className="mb-10">
      <div className="mb-4">
        <h2 className="section-title mb-0">
          💡 提议池
          <span className="text-base font-normal text-gray-400 ml-2">({filteredAll.length})</span>
        </h2>
        <p className="text-sm text-gray-500 mt-1">有好去处？告诉大家</p>
      </div>
      <div className="mb-3">
        <CategoryFilter selected={filter} onChange={setFilter} />
      </div>
      {filtered.length === 0 ? (
        <p className="text-gray-400 text-sm">
          {filter.length > 0 ? '暂无该类型活动' : '还没有提议，来做第一个吧！'}
        </p>
      ) : (
        <div className="space-y-4">
          {filtered.map((a) => (
            <ProposalCard key={a.id} activity={a} />
          ))}
          {proposedOverflow && filter.length === 0 && (
            <div className="text-right pt-2">
              <Link href="/proposals" className="text-sm text-green-600 hover:underline">
                查看全部提议（共{proposedAll.length}条）→
              </Link>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
