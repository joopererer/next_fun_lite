'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { Header } from '@/src/components/layout/Header'
import { Footer } from '@/src/components/layout/Footer'
import { HomeNotificationBanner } from '@/src/components/notifications/HomeNotificationBanner'
import { HomeRegistrationProvider } from './HomeRegistrationContext'

export function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <HomeRegistrationProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="sticky top-[57px] z-30 bg-warm-bg/95 backdrop-blur-sm border-b border-gray-100">
          <div className="max-w-3xl mx-auto px-4 py-2">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/propose"
                className="btn-primary inline-flex items-center gap-1.5 text-xs sm:text-sm py-1.5 px-3 sm:px-3.5 rounded-full"
              >
                <span>💡</span>
                <span className="sm:hidden">提议</span>
                <span className="hidden sm:inline">我有个提议</span>
              </Link>
              <Link
                href="/recruit/new"
                className="btn-primary inline-flex items-center gap-1.5 text-xs sm:text-sm py-1.5 px-3 sm:px-3.5 rounded-full"
              >
                <span>🟢</span>
                <span className="sm:hidden">招募</span>
                <span className="hidden sm:inline">发起招募</span>
              </Link>
              <Link
                href="/info/new"
                className="btn-primary inline-flex items-center gap-1.5 text-xs sm:text-sm py-1.5 px-3 sm:px-3.5 rounded-full"
              >
                <span>📢</span>
                <span className="sm:hidden">资讯</span>
                <span className="hidden sm:inline">发布资讯</span>
              </Link>
            </div>
          </div>
        </div>
        <main className="flex-1 max-w-3xl mx-auto px-4 py-6 page-enter w-full">
          <HomeNotificationBanner />
          {children}
        </main>
        <Footer />
      </div>
    </HomeRegistrationProvider>
  )
}
