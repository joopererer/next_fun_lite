'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { Lang } from './types'
import { zh } from './zh'
import { en } from './en'

const LANG_KEY = 'nfl:lang'

function detectLang(): Lang {
  if (typeof window === 'undefined') return 'zh'
  const stored = localStorage.getItem(LANG_KEY) as Lang | null
  if (stored === 'zh' || stored === 'en') return stored
  const browser = navigator.language?.toLowerCase() ?? ''
  if (browser.startsWith('zh')) return 'zh'
  return 'en'
}

const translations = { zh, en }

interface LanguageContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: typeof zh
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'zh',
  setLang: () => {},
  t: zh,
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('zh')

  useEffect(() => {
    setLangState(detectLang())
  }, [])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    localStorage.setItem(LANG_KEY, l)
  }, [])

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useT() {
  return useContext(LanguageContext).t
}

export function useLang() {
  const { lang, setLang } = useContext(LanguageContext)
  return { lang, setLang }
}
