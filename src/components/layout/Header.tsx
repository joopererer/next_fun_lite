'use client'

import Link from 'next/link'
import { HeaderUserMenu } from './HeaderUserMenu'

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-warm-bg/90 backdrop-blur border-b border-gray-100">
      <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="block">
          <h1 className="text-lg font-bold text-green-700">🎉 快乐制造局</h1>
          <p className="text-xs text-gray-500">Next Fun Club · 巴黎</p>
        </Link>
        <HeaderUserMenu />
      </div>
    </header>
  )
}
