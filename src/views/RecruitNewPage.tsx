'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import type { ActivityWithCount } from '../../shared/types'
import { Header } from '../components/layout/Header'
import { SignInGate } from '../components/SignInGate'
import { RecruitForm } from '../components/recruit/RecruitForm'
import { Footer } from '../components/layout/Footer'
import { api } from '../lib/api'
import { isInfoPost } from '../lib/infoVisibility'
import { useT } from '../i18n/LanguageContext'

export function RecruitNewPage() {
  const searchParams = useSearchParams()
  const fromId = searchParams.get('from')
  const fromInfoId = searchParams.get('from_info')
  const sourceId = fromId ?? fromInfoId
  const [sourceActivity, setSourceActivity] = useState<ActivityWithCount | null>(null)
  const [loading, setLoading] = useState(!!sourceId)
  const t = useT()

  useEffect(() => {
    if (!sourceId) return
    api.getActivity(sourceId)
      .then(setSourceActivity)
      .catch(() => setSourceActivity(null))
      .finally(() => setLoading(false))
  }, [sourceId])

  const fromInfo = Boolean(fromInfoId && sourceActivity && isInfoPost(sourceActivity))

  const initial = sourceActivity
    ? {
        title: sourceActivity.title,
        description: sourceActivity.description,
        sourceUrl: sourceActivity.sourceUrl,
        category: sourceActivity.category,
        location: sourceActivity.location,
        meetingLocation: sourceActivity.meetingLocation,
        fee: fromInfo ? (sourceActivity.infoPrice ?? sourceActivity.fee) : sourceActivity.fee,
        feeLevel: sourceActivity.feeLevel,
        itinerary: sourceActivity.itinerary,
        notes: sourceActivity.notes,
      }
    : undefined

  return (
    <div className="min-h-screen flex flex-col pb-24">
      <Header />
      <SignInGate>
      <main className="flex-1 max-w-lg mx-auto px-4 py-6 page-enter w-full">
        <h1 className="text-2xl font-bold mb-1">{t.recruitTitle} 🎯</h1>
        <p className="text-gray-500 text-sm mb-6">{t.recruitSubtitle}</p>

        {loading ? (
          <div className="text-center text-gray-400 py-12">{t.loading}</div>
        ) : (
          <>
            {sourceActivity && fromInfo && (
              <div className="bg-green-50 text-green-800 text-sm rounded-xl p-3 mb-6">
                {t.recruitFromInfo(sourceActivity.title)}
              </div>
            )}
            {sourceActivity && fromId && !fromInfo && (
              <div className="bg-green-50 text-green-800 text-sm rounded-xl p-3 mb-6">
                {t.recruitFromProposal(sourceActivity.title)}
              </div>
            )}
            {sourceId && !sourceActivity && !loading && (
              <div className="bg-amber-50 text-amber-800 text-sm rounded-xl p-3 mb-6">
                {t.recruitSourceNotFound}
              </div>
            )}
            <RecruitForm
              mode="public"
              initial={initial}
              sourceProposalId={sourceActivity && fromId && !fromInfo ? fromId : undefined}
              sourceProposalTitle={sourceActivity && fromId && !fromInfo ? sourceActivity.title : undefined}
              sourceInterestedCount={sourceActivity && fromId && !fromInfo ? sourceActivity.interestedCount : undefined}
              sourceInfoId={fromInfo ? fromInfoId ?? undefined : undefined}
            />
            <Link href="/" className="block text-center text-sm text-gray-500 mt-6">{t.backToHome}</Link>
          </>
        )}
      </main>
      </SignInGate>
      <Footer />
    </div>
  )
}
