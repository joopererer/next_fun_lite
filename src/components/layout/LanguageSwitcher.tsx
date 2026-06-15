'use client'

import { useLang } from '@/src/i18n/LanguageContext'

export function LanguageSwitcher() {
  const { lang, setLang } = useLang()

  return (
    <button
      type="button"
      onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
      className="flex items-center gap-1 text-sm px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
      title={lang === 'zh' ? 'Switch to English' : '切换为中文'}
      aria-label={lang === 'zh' ? 'Switch to English' : '切换为中文'}
    >
      <span className="text-base leading-none">{lang === 'zh' ? '🇨🇳' : '🇬🇧'}</span>
      <span className="text-xs text-gray-500 hidden sm:inline">{lang === 'zh' ? 'EN' : '中'}</span>
    </button>
  )
}
