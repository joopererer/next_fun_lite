'use client'

import type { ReactNode } from 'react'
import { Header } from '@/src/components/layout/Header'
import { Footer } from '@/src/components/layout/Footer'
import { HomeNotificationBanner } from '@/src/components/notifications/HomeNotificationBanner'
import { HomeRegistrationProvider } from './HomeRegistrationContext'
import { HomeQuickActions } from './HomeQuickActions'

export function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <HomeRegistrationProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <HomeQuickActions />
        <main className="flex-1 max-w-3xl mx-auto px-4 py-6 page-enter w-full">
          <HomeNotificationBanner />
          {children}
        </main>
        <Footer />
      </div>
    </HomeRegistrationProvider>
  )
}
