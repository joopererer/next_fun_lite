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

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}天前`
  return new Date(iso).toLocaleDateString('zh-CN')
}

export function formatEventDate(iso: string | null): string {
  if (!iso) return '时间待定'
  const d = new Date(iso)
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${d.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })} ${weekdays[d.getDay()]} ${d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
}

export function getSourceIcon(sourceUrl: string): string {
  if (!sourceUrl) return '✏️'
  if (sourceUrl.startsWith('data:') || sourceUrl.includes('image')) return '🖼'
  return '🔗'
}
