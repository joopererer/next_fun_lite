'use client'

import Link from 'next/link'
import { HeaderUserMenu } from './HeaderUserMenu'

interface HeaderProps {
  /** When true, omit sticky positioning (used inside a parent sticky shell on home). */
  embedded?: boolean
}

export function Header({ embedded = false }: HeaderProps) {
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
          <h1 className="text-base sm:text-lg font-bold text-green-700">🎉 快乐制造局</h1>
        </Link>
        <HeaderUserMenu />
      </div>
    </header>
  )
}
