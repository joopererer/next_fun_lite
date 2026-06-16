'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import type { ActivityCategory, ActivityWithCount } from '@/shared/types'
import { CategoryFilter, matchesCategoryFilter } from '@/src/components/CategoryFilter'
import { Header } from '@/src/components/layout/Header'
import { Footer } from '@/src/components/layout/Footer'
import { ProposalCard } from '@/src/components/ProposalCard'
import { isEndedCancelled } from '@/src/lib/activityStatus'
import { api } from '@/src/lib/api'
import { filterProposalsBySearch, sortProposals, type ProposalSort } from '@/src/lib/proposals'
import { useT } from '@/src/i18n/LanguageContext'

export function ProposalsPage() {
  const [activities, setActivities] = useState<ActivityWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<ActivityCategory[]>([])
  const [sort, setSort] = useState<ProposalSort>('newest')
  const [search, setSearch] = useState('')
  const t = useT()

  const load = useCallback(() => {
    setLoading(true)
    api.getActivities()
      .then((list) => setActivities(list.filter((a) => !isEndedCancelled(a.status) && a.status === 'proposed')))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const displayed = useMemo(() => {
    let list = activities.filter((a) => matchesCategoryFilter(a.category, filter))
    list = filterProposalsBySearch(list, search)
    return sortProposals(list, sort)
  }, [activities, filter, search, sort])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto px-4 py-6 page-enter w-full">
        <Link href="/" className="text-sm text-gray-500 hover:text-green-600 mb-4 inline-block">
          {t.backToHome}
        </Link>
        <h1 className="text-2xl font-bold mb-6">{t.proposalsPageTitle}</h1>

        <div className="mb-4">
          <CategoryFilter selected={filter} onChange={setFilter} />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            className="input-field flex-1"
            placeholder={t.proposalsSearchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="input-field sm:w-44"
            value={sort}
            onChange={(e) => setSort(e.target.value as ProposalSort)}
          >
            <option value="newest">{t.proposalsSortNewest}</option>
            <option value="most_interested">{t.proposalsSortMostInterested}</option>
            <option value="oldest">{t.proposalsSortOldest}</option>
          </select>
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-12">{t.loading}</p>
        ) : displayed.length === 0 ? (
          <p className="text-center text-gray-400 py-12">{t.proposalsEmpty}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {displayed.map((a) => (
              <ProposalCard
                key={a.id}
                activity={a}
                onInterestUpdate={(id, interestedCount) => {
                  setActivities((prev) =>
                    prev.map((item) => (item.id === id ? { ...item, interestedCount } : item))
                  )
                }}
              />
            ))}
          </div>
        )}
      </main>

      <Link
        href="/propose"
        className="fixed bottom-6 right-6 btn-primary rounded-full shadow-lg px-5 py-3 text-sm z-40"
      >
        {t.proposalsAddButton}
      </Link>

      <Footer />
    </div>
  )
}
