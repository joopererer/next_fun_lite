'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import type { ActivityWithCount } from '../../shared/types'
import { Header } from '../components/layout/Header'
import { SignInGate } from '../components/SignInGate'
import { RecruitForm } from '../components/recruit/RecruitForm'
import { api } from '../lib/api'

export function RecruitNewPage() {
  const searchParams = useSearchParams()
  const fromId = searchParams.get('from')
  const [sourceActivity, setSourceActivity] = useState<ActivityWithCount | null>(null)
  const [loading, setLoading] = useState(!!fromId)

  useEffect(() => {
    if (!fromId) return
    api.getActivity(fromId)
      .then(setSourceActivity)
      .catch(() => setSourceActivity(null))
      .finally(() => setLoading(false))
  }, [fromId])

  const initial = sourceActivity
    ? {
        title: sourceActivity.title,
        description: sourceActivity.description,
        sourceUrl: sourceActivity.sourceUrl,
        category: sourceActivity.category,
        location: sourceActivity.location,
        fee: sourceActivity.fee,
        feeLevel: sourceActivity.feeLevel,
        itinerary: sourceActivity.itinerary,
        notes: sourceActivity.notes,
      }
    : undefined

  return (
    <div className="min-h-screen pb-24">
      <Header />
      <SignInGate message="登录后即可发起招募">
      <main className="max-w-lg mx-auto px-4 py-6 page-enter">
        <h1 className="text-2xl font-bold mb-1">发起招募 🎯</h1>
        <p className="text-gray-500 text-sm mb-6">填写活动详情，创建公开报名链接</p>

        {loading ? (
          <div className="text-center text-gray-400 py-12">加载中...</div>
        ) : (
          <>
            {sourceActivity && (
              <div className="bg-green-50 text-green-800 text-sm rounded-xl p-3 mb-6">
                💡 从提议「{sourceActivity.title}」转为招募，以下信息已自动填入
              </div>
            )}
            {fromId && !sourceActivity && !loading && (
              <div className="bg-amber-50 text-amber-800 text-sm rounded-xl p-3 mb-6">
                ⚠️ 未找到原提议，请手动填写
              </div>
            )}
            <RecruitForm
              mode="public"
              initial={initial}
              sourceProposalId={sourceActivity ? fromId ?? undefined : undefined}
            />
            <Link href="/" className="block text-center text-sm text-gray-500 mt-6">← 回到首页</Link>
          </>
        )}
      </main>
      </SignInGate>
    </div>
  )
}
