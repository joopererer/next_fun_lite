'use client'

import { Suspense } from 'react'
import { AdminPage } from '@/src/views/AdminPage'

function AdminPageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      加载中...
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<AdminPageFallback />}>
      <AdminPage />
    </Suspense>
  )
}
