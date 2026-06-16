export interface UserIdentity {
  name: string
  wechat: string
}

const USER_KEY = 'nfl_user'

export function getUser(): UserIdentity | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    return JSON.parse(raw) as UserIdentity
  } catch {
    return null
  }
}

export function saveUser(user: UserIdentity): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

function interestKey(activityId: string): string {
  return `nfl_interest_${activityId}`
}

export function hasInterest(activityId: string): boolean {
  return localStorage.getItem(interestKey(activityId)) === '1'
}

export function setInterest(activityId: string, active: boolean): void {
  if (active) localStorage.setItem(interestKey(activityId), '1')
  else localStorage.removeItem(interestKey(activityId))
}

function registrationKey(activityId: string): string {
  return `nfl_registered_${activityId}`
}

export function isRegistered(activityId: string): boolean {
  return localStorage.getItem(registrationKey(activityId)) === '1'
}

export function setRegistered(activityId: string, active: boolean): void {
  if (active) localStorage.setItem(registrationKey(activityId), '1')
  else localStorage.removeItem(registrationKey(activityId))
}

export type Lang = 'zh' | 'en'

export function formatRelativeTime(iso: string, lang: Lang = 'zh'): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60000)
  if (lang === 'en') {
    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes} min ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}天前`
  return new Date(iso).toLocaleDateString('zh-CN')
}

export function formatEventDate(iso: string | null, lang: Lang = 'zh'): string {
  if (!iso) return lang === 'en' ? 'TBD' : '时间待定'
  const d = new Date(iso)
  const now = new Date()
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
  if (lang === 'en') {
    const yearSuffix = d.getFullYear() !== now.getFullYear() ? ` ${d.getFullYear()}` : ''
    const dateStr = d.toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' })
    return `${dateStr}${yearSuffix} ${time}`
  }
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const month = d.getMonth() + 1
  const day = d.getDate()
  const yearPrefix = d.getFullYear() !== now.getFullYear() ? `${d.getFullYear()}年` : ''
  return `${yearPrefix}${month}月${day}日 ${weekdays[d.getDay()]} ${time}`
}

export function formatListDate(iso: string | null, lang: Lang = 'zh'): string {
  if (!iso) return lang === 'en' ? 'TBD' : '时间待定'
  const d = new Date(iso)
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
  if (lang === 'en') {
    return d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }) + ' ' + time
  }
  const month = d.getMonth() + 1
  const day = d.getDate()
  return `${month}月${day}日 ${time}`
}

export function getSourceIcon(sourceUrl: string): string {
  if (!sourceUrl) return '✏️'
  if (sourceUrl.startsWith('data:') || sourceUrl.includes('image')) return '🖼'
  return '🔗'
}
