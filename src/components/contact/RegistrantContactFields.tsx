'use client'

import type { RegistrantContactType } from '../../../shared/types'
import { useT } from '../../i18n/LanguageContext'

interface Props {
  contactType: RegistrantContactType
  contactValue: string
  contactLabel: string
  onTypeChange: (type: RegistrantContactType) => void
  onValueChange: (value: string) => void
  onLabelChange: (value: string) => void
}

export function RegistrantContactFields({
  contactType,
  contactValue,
  contactLabel,
  onTypeChange,
  onValueChange,
  onLabelChange,
}: Props) {
  const t = useT()

  const OPTIONS: { value: RegistrantContactType; label: string; placeholder: string }[] = [
    { value: 'wechat', label: t.contactWechat, placeholder: t.wechatPlaceholder },
    { value: 'email', label: t.contactEmail, placeholder: t.emailPlaceholder },
    { value: 'other', label: t.contactOther, placeholder: t.otherPlaceholder },
  ]

  const current = OPTIONS.find((o) => o.value === contactType) ?? OPTIONS[0]

  return (
    <div>
      <label className="text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2 block">{t.contactLabel} *</label>
      <div className="space-y-1.5 sm:space-y-2 mb-2 sm:mb-3">
        {OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className={`flex items-center gap-2 p-2 sm:p-2.5 rounded-xl border cursor-pointer text-xs sm:text-sm ${
              contactType === opt.value ? 'border-green-400 bg-green-50' : 'border-gray-200'
            }`}
          >
            <input
              type="radio"
              name="registrantContactType"
              value={opt.value}
              checked={contactType === opt.value}
              onChange={() => onTypeChange(opt.value)}
            />
            {opt.label}
          </label>
        ))}
      </div>
      {contactType === 'other' && (
        <input
          className="input-field mb-2 text-sm"
          value={contactLabel}
          onChange={(e) => onLabelChange(e.target.value)}
          placeholder={t.contactOtherPlaceholder}
        />
      )}
      <input
        className="input-field"
        type={contactType === 'email' ? 'email' : 'text'}
        value={contactValue}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={current.placeholder}
      />
    </div>
  )
}
