'use client'

import Link from 'next/link'
import { useT } from '@/src/i18n/LanguageContext'

export function HomeQuickActions() {
  const t = useT()
  return (
    <div className="border-b border-gray-100 bg-warm-bg/95">
      <div className="max-w-3xl mx-auto px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/propose"
            className="btn-primary inline-flex items-center gap-1.5 text-xs sm:text-sm py-1.5 px-3 sm:px-3.5 rounded-full"
          >
            <span>💡</span>
            <span className="sm:hidden">{t.quickProposeMobile}</span>
            <span className="hidden sm:inline">{t.quickPropose}</span>
          </Link>
          <span className="text-gray-400 text-sm font-medium select-none" aria-hidden>
            →
          </span>
          <Link
            href="/recruit/new"
            className="btn-primary inline-flex items-center gap-1.5 text-xs sm:text-sm py-1.5 px-3 sm:px-3.5 rounded-full"
          >
            <span>🟢</span>
            <span className="sm:hidden">{t.quickRecruitMobile}</span>
            <span className="hidden sm:inline">{t.quickRecruit}</span>
          </Link>
          <span
            className="text-gray-300 text-sm font-light select-none ml-2 sm:ml-5 mr-2 sm:mr-5"
            aria-hidden
          >
            |
          </span>
          <Link
            href="/info/new"
            className="btn-primary inline-flex items-center gap-1.5 text-xs sm:text-sm py-1.5 px-3 sm:px-3.5 rounded-full"
          >
            <span>📢</span>
            <span className="sm:hidden">{t.quickInfoMobile}</span>
            <span className="hidden sm:inline">{t.quickInfo}</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
