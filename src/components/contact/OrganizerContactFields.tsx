'use client'

import type { OrganizerContactType } from '../../../shared/types'
import { useT } from '../../i18n/LanguageContext'

interface Props {
  contactType: OrganizerContactType
  contact: string
  contactLabel: string
  onTypeChange: (type: OrganizerContactType) => void
  onContactChange: (value: string) => void
  onLabelChange: (value: string) => void
}

export function OrganizerContactFields({
  contactType,
  contact,
  contactLabel,
  onTypeChange,
  onContactChange,
  onLabelChange,
}: Props) {
  const t = useT()

  const OPTIONS: { value: OrganizerContactType; label: string }[] = [
    { value: 'private', label: t.organizerContactPrivate },
    { value: 'wechat', label: 'WeChat' },
    { value: 'email', label: 'Email' },
    { value: 'other', label: t.other },
  ]

  return (
    <div>
      <label className="text-sm text-gray-600 mb-2 block">{t.organizerContactLabel}</label>
      <div className="space-y-2">
        {OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className={`flex items-start gap-2 p-3 rounded-xl border cursor-pointer transition-colors ${
              contactType === opt.value ? 'border-green-400 bg-green-50' : 'border-gray-200'
            }`}
          >
            <input
              type="radio"
              name="organizerContactType"
              value={opt.value}
              checked={contactType === opt.value}
              onChange={() => onTypeChange(opt.value)}
              className="mt-1"
            />
            <span className="text-sm flex-1 min-w-0">
              <span className="block">{opt.label}</span>
              {contactType === opt.value && opt.value === 'wechat' && (
                <input
                  className="input-field mt-2 text-sm"
                  value={contact}
                  onChange={(e) => onContactChange(e.target.value)}
                  placeholder="WeChat ID"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
              {contactType === opt.value && opt.value === 'email' && (
                <input
                  className="input-field mt-2 text-sm"
                  type="email"
                  value={contact}
                  onChange={(e) => onContactChange(e.target.value)}
                  placeholder="email@example.com"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
              {contactType === opt.value && opt.value === 'other' && (
                <div className="mt-2 space-y-2" onClick={(e) => e.stopPropagation()}>
                  <input
                    className="input-field text-sm"
                    value={contactLabel}
                    onChange={(e) => onLabelChange(e.target.value)}
                    placeholder={t.organizerContactOtherLabelPlaceholder}
                  />
                  <input
                    className="input-field text-sm"
                    value={contact}
                    onChange={(e) => onContactChange(e.target.value)}
                    placeholder={t.organizerContactValuePlaceholder}
                  />
                </div>
              )}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}
