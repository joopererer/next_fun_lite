'use client'

import { useT } from '@/src/i18n/LanguageContext'

export function Footer() {
  const t = useT()
  return (
    <footer className="max-w-4xl mx-auto px-4 py-6 text-sm text-gray-400 text-center sm:text-left">
      {t.footerCopyright}
    </footer>
  )
}
