'use client'

import type { RegistrantContactType } from '../../../shared/types'

interface Props {
  contactType: RegistrantContactType
  contactValue: string
  contactLabel: string
  onTypeChange: (type: RegistrantContactType) => void
  onValueChange: (value: string) => void
  onLabelChange: (value: string) => void
}

const OPTIONS: { value: RegistrantContactType; label: string; placeholder: string }[] = [
  { value: 'wechat', label: '微信号', placeholder: '你的微信号' },
  { value: 'email', label: '邮箱', placeholder: 'your@email.com' },
  { value: 'other', label: '其他', placeholder: '如 Instagram、手机号' },
]

export function RegistrantContactFields({
  contactType,
  contactValue,
  contactLabel,
  onTypeChange,
  onValueChange,
  onLabelChange,
}: Props) {
  const current = OPTIONS.find((o) => o.value === contactType) ?? OPTIONS[0]

  return (
    <div>
      <label className="text-sm text-gray-600 mb-2 block">联系方式 *</label>
      <div className="space-y-2 mb-3">
        {OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-sm ${
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
          placeholder="类型说明（选填），如 Instagram"
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
