'use client'

import { useT } from '@/src/i18n/LanguageContext'

interface Props {
  count: string
  hasItems: boolean
}

export function InfoSectionTitle({ count, hasItems }: Props) {
  const t = useT()
  return (
    <>
      <h2 className="section-title">
        {t.sectionInfo}
        <span className="text-base font-normal text-gray-400 ml-2">({count})</span>
      </h2>
      {!hasItems && (
        <p className="text-gray-400 text-sm">{t.noInfo}</p>
      )}
    </>
  )
}
