import type { Activity, Registration } from './types'

export type OrganizerContactType = 'wechat' | 'email' | 'other' | 'private'
export type RegistrantContactType = 'wechat' | 'email' | 'other'

export interface ResolvedOrganizerContact {
  type: OrganizerContactType
  contact: string
  label?: string
}

export interface ResolvedRegistrationContact {
  type: RegistrantContactType
  value: string
  label?: string
}

export function resolveOrganizerContact(activity: Partial<Activity>): ResolvedOrganizerContact {
  if (activity.organizerContactType) {
    return {
      type: activity.organizerContactType,
      contact: activity.organizerContact ?? '',
      label: activity.organizerContactLabel,
    }
  }
  if (activity.organizerWechat?.trim()) {
    return { type: 'wechat', contact: activity.organizerWechat.trim() }
  }
  return { type: 'private', contact: '' }
}

export function resolveRegistrationContact(reg: Partial<Registration>): ResolvedRegistrationContact {
  if (reg.contactType) {
    return {
      type: reg.contactType,
      value: reg.contactValue ?? '',
      label: reg.contactLabel,
    }
  }
  if (reg.wechat?.trim()) {
    return { type: 'wechat', value: reg.wechat.trim() }
  }
  return { type: 'other', value: '', label: reg.contactLabel }
}

export function syncOrganizerWechatFromContact(
  type: OrganizerContactType,
  contact: string,
): string {
  return type === 'wechat' ? contact.trim() : ''
}

export function syncWechatFromRegistrationContact(
  type: RegistrantContactType,
  value: string,
): string {
  return type === 'wechat' ? value.trim() : ''
}

export function formatOrganizerContactHint(resolved: ResolvedOrganizerContact): {
  message: string
  copyText?: string
  copyLabel?: string
} {
  switch (resolved.type) {
    case 'private':
      return { message: '发起人将主动联系你确认报名' }
    case 'wechat':
      return {
        message: `报名后添加发起人微信：${resolved.contact}`,
        copyText: resolved.contact,
        copyLabel: '复制微信号',
      }
    case 'email':
      return {
        message: `报名后发送邮件至：${resolved.contact}`,
        copyText: resolved.contact,
        copyLabel: '复制邮箱',
      }
    case 'other': {
      const label = resolved.label?.trim() || '联系方式'
      return {
        message: `报名后通过 ${label} 联系：${resolved.contact}`,
        copyText: resolved.contact,
        copyLabel: `复制${label}`,
      }
    }
  }
}

export function formatOrganizerContactLine(activity: Partial<Activity>): string {
  const { type, contact, label } = resolveOrganizerContact(activity)
  switch (type) {
    case 'private':
      return '不公开'
    case 'wechat':
      return contact ? `微信: ${contact}` : '—'
    case 'email':
      return contact ? `Email: ${contact}` : '—'
    case 'other':
      return label ? `${label}: ${contact || '—'}` : contact || '—'
  }
}

export function formatRegistrationContactLine(reg: Partial<Registration>): string {
  const { type, value, label } = resolveRegistrationContact(reg)
  switch (type) {
    case 'wechat':
      return value ? `微信: ${value}` : '微信: —'
    case 'email':
      return value ? `Email: ${value}` : 'Email: —'
    case 'other':
      return label ? `${label}: ${value || '—'}` : value || '—'
  }
}
