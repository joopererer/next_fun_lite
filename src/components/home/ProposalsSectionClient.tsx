'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { ActivityCategory, ActivityWithCount } from '@/shared/types'
import { ACTIVITY_CATEGORIES } from '@/src/lib/categories'
import { CategoryFilter, matchesCategoryFilter } from '@/src/components/CategoryFilter'
import { ProposalCard } from '@/src/components/ProposalCard'
import { useT } from '@/src/i18n/LanguageContext'
import { sortProposalsForHome } from '@/src/lib/proposals'

interface Props {
  proposedAll: ActivityWithCount[]
}

export function ProposalsSectionClient({ proposedAll }: Props) {
  const [filter, setFilter] = useState<ActivityCategory[]>([])
  const t = useT()

  const counts = useMemo(
    () =>
      Object.fromEntries(
        ACTIVITY_CATEGORIES.map((c) => [
          c.value,
          proposedAll.filter((a) => a.category === c.value).length,
        ]),
      ) as Partial<Record<ActivityCategory, number>>,
    [proposedAll],
  )

  const filteredAll = proposedAll.filter((a) => matchesCategoryFilter(a.category, filter))
  const filtered = sortProposalsForHome(filteredAll)
  const proposedOverflow = filteredAll.length > filtered.length

  return (
    <section className="mb-8 sm:mb-10">
      <div className="mb-4">
        <h2 className="section-title mb-0">
          {t.sectionProposals}
          <span className="text-base font-normal text-gray-400 ml-2">({filteredAll.length})</span>
        </h2>
        <p className="text-sm text-gray-500 mt-1">{t.sectionProposalsSubtitle}</p>
      </div>
      <div className="mb-3">
        <CategoryFilter selected={filter} onChange={setFilter} counts={counts} totalCount={proposedAll.length} />
      </div>
      {filtered.length === 0 ? (
        <p className="text-gray-400 text-sm">
          {filter.length > 0 ? t.noProposalsFilter : t.noProposals}
        </p>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filtered.map((a) => (
            <ProposalCard key={a.id} activity={a} />
          ))}
          {proposedOverflow && filter.length === 0 && (
            <div className="text-right pt-2">
              <Link href="/proposals" className="text-sm text-green-600 hover:underline">
                {t.viewAllProposals}（{proposedAll.length}）
              </Link>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
