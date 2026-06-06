'use client'

import { Suspense } from 'react'
import { RecruitNewPage } from '@/src/views/RecruitNewPage'

function RecruitPageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      加载中...
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<RecruitPageFallback />}>
      <RecruitNewPage />
    </Suspense>
  )
}
