'use client'

import Link from 'next/link'
import { useT } from '@/src/i18n/LanguageContext'
import { LanguageSwitcher } from './LanguageSwitcher'
import { HeaderUserMenu } from './HeaderUserMenu'

interface HeaderProps {
  /** When true, omit sticky positioning (used inside a parent sticky shell on home). */
  embedded?: boolean
}

export function Header({ embedded = false }: HeaderProps) {
  const t = useT()
  return (
    <header
      className={
        embedded
          ? 'bg-warm-bg/90 backdrop-blur border-b border-gray-100'
          : 'sticky top-0 z-40 bg-warm-bg/90 backdrop-blur border-b border-gray-100'
      }
    >
      <div className="max-w-3xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
        <Link href="/" className="block">
          <h1 className="text-base sm:text-lg font-bold text-green-700">{t.siteName}</h1>
        </Link>
        <div className="flex items-center gap-1">
          <HeaderUserMenu />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  )
}
