import type { RegistrantContactType } from '../../shared/types'

export function parseRegistrationContact(body: {
  contactType?: RegistrantContactType
  contactValue?: string
  contactLabel?: string
  wechat?: string
}): {
  contactType: RegistrantContactType
  contactValue: string
  contactLabel?: string
  wechat: string
} {
  const contactType = body.contactType ?? 'wechat'
  const contactValue = body.contactValue?.trim() ?? body.wechat?.trim() ?? ''
  const contactLabel = body.contactLabel?.trim() || undefined
  const wechat = contactType === 'wechat' ? contactValue : (body.wechat?.trim() ?? '')
  return {
    contactType,
    contactValue,
    contactLabel,
    wechat: wechat || (contactType === 'wechat' ? contactValue : '—'),
  }
}
