import type {
  Activity,
  ActivityWithCount,
  ApiParseResponse,
  Interest,
  InterestMutationResult,
  Notification,
  Profile,
  RecruitmentResponse,
  Registration,
  RegistrationMutationResult,
} from '@/shared/types'
import type { SimilarProposalMatch } from '@/shared/activityDedupe'
import type { ParsedImportRow } from '@/shared/excelImport'
import { getDeviceId } from '@/src/utils/device'

const ADMIN_KEY = 'nfl_admin_password'

let tokenGetter: (() => Promise<string | null>) | null = null

export function setAuthTokenGetter(getter: () => Promise<string | null>): void {
  tokenGetter = getter
}

export function getAdminPassword(): string | null {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem(ADMIN_KEY)
}

export function setAdminPassword(password: string): void {
  sessionStorage.setItem(ADMIN_KEY, password)
}

export function clearAdminPassword(): void {
  sessionStorage.removeItem(ADMIN_KEY)
}

function adminHeaders(): HeadersInit {
  const password = getAdminPassword()
  return password ? { 'X-Admin-Password': password } : {}
}

async function authHeaders(): Promise<HeadersInit> {
  if (!tokenGetter) return {}
  const token = await tokenGetter()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function deviceHeaders(): Promise<HeadersInit> {
  if (typeof window === 'undefined') return {}
  return { 'X-Device-Id': getDeviceId() }
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...adminHeaders(),
      ...(await authHeaders()),
      ...(await deviceHeaders()),
      ...options.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((err as { error?: string }).error ?? 'Request failed')
  }
  return res.json() as Promise<T>
}

export interface MyRegistrationsResponse {
  registrations: Record<string, Registration>
  activities: ActivityWithCount[]
}

export interface RegistrationSummary {
  total: number
  previews: Array<{ name: string; avatarUrl: string | null }>
}

export const api = {
  getActivities: () => request<ActivityWithCount[]>('/api/activities'),
  getActivitiesByIds: (ids: string[]) =>
    request<ActivityWithCount[]>(
      `/api/activities/by-ids?ids=${ids.map(encodeURIComponent).join(',')}`,
    ),
  getActivity: (id: string) => request<ActivityWithCount>(`/api/activities/${id}`),
  createProposal: (data: Partial<Activity>) =>
    request<Activity>('/api/proposals', { method: 'POST', body: JSON.stringify(data) }),
  createInfo: (data: Partial<Activity>) =>
    request<Activity>('/api/info', { method: 'POST', body: JSON.stringify(data) }),
  findSimilarProposals: (params: { title: string; location?: string; sourceUrl?: string }) => {
    const q = new URLSearchParams({ title: params.title })
    if (params.location) q.set('location', params.location)
    if (params.sourceUrl) q.set('sourceUrl', params.sourceUrl)
    return request<{ matches: SimilarProposalMatch[] }>(`/api/proposals/similar?${q.toString()}`)
  },
  createRecruitment: (data: Partial<Activity> & { sourceProposalId?: string }) =>
    request<RecruitmentResponse>('/api/recruitments', { method: 'POST', body: JSON.stringify(data) }),
  createActivity: (data: Partial<Activity>) =>
    request<Activity>('/api/activities', { method: 'POST', body: JSON.stringify(data) }),
  updateActivity: (id: string, data: Partial<Activity>) =>
    request<ActivityWithCount>(`/api/activities/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteActivity: (id: string) =>
    request<{ ok: boolean }>(`/api/activities/${id}`, { method: 'DELETE' }),
  getRegistrations: (activityId: string) =>
    request<Registration[]>(`/api/activities/${activityId}/registrations`),
  getMyRegistration: (activityId: string, wechat?: string) =>
    request<{ registration: Registration | null; registeredCount: number }>(
      wechat
        ? `/api/activities/${activityId}/registration?wechat=${encodeURIComponent(wechat)}`
        : `/api/activities/${activityId}/registration`,
    ),
  getMyRegistrations: () => request<MyRegistrationsResponse>('/api/my-registrations'),
  getProfile: () => request<Profile | null>('/api/profile'),
  saveProfile: (data: {
    nickname?: string
    wechat?: string
    notificationEmail?: string
    notifyRegistrationChange?: boolean
    notifyActivityReminder?: boolean
    notifyProposalRecruiting?: boolean
    notifyNewRecruit?: boolean
    notifyInfoReminder?: boolean
  }) => request<Profile>('/api/profile', { method: 'POST', body: JSON.stringify(data) }),
  getUnreadNotificationCount: () => request<{ count: number }>('/api/notifications/unread-count'),
  getNotifications: () => request<Notification[]>('/api/notifications'),
  markNotificationRead: (id: string) =>
    request<{ ok: boolean }>(`/api/notifications/${encodeURIComponent(id)}`, { method: 'PATCH' }),
  markAllNotificationsRead: () =>
    request<{ ok: boolean }>('/api/notifications', { method: 'PATCH' }),
  getInfoInterestStatus: (activityId: string) =>
    request<{ subscribed: boolean }>(`/api/info-interests/${encodeURIComponent(activityId)}`),
  subscribeInfoReminder: (data: { activityId: string; email?: string }) =>
    request<{ id: string }>('/api/info-interests', { method: 'POST', body: JSON.stringify(data) }),
  unsubscribeInfoReminder: (activityId: string) =>
    request<{ ok: boolean }>('/api/info-interests', {
      method: 'DELETE',
      body: JSON.stringify({ activityId }),
    }),
  createRegistration: (data: {
    activityId: string
    name?: string
    wechat?: string
    contactType?: 'wechat' | 'email' | 'other'
    contactValue?: string
    contactLabel?: string
    participantCount: number
    note: string
  }) =>
    request<RegistrationMutationResult>('/api/registrations', { method: 'POST', body: JSON.stringify(data) }),
  cancelRegistration: (data: { activityId: string; wechat?: string }) =>
    request<RegistrationMutationResult>('/api/registrations', {
      method: 'POST',
      body: JSON.stringify({ ...data, action: 'remove' as const }),
    }),
  cancelRegistrationById: (id: string) =>
    request<RegistrationMutationResult>(`/api/registrations/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),
  getRegistrationSummary: (activityId: string) =>
    request<RegistrationSummary>(`/api/activities/${activityId}/registrations/summary`),
  createInterest: (data: { activityId: string; name?: string; wechat?: string }) =>
    request<InterestMutationResult>('/api/interests', { method: 'POST', body: JSON.stringify(data) }),
  getInterests: (activityId: string) =>
    request<Interest[]>(`/api/activities/${activityId}/interests`),
  deleteInterest: (data: { activityId: string; wechat?: string }) =>
    request<InterestMutationResult>('/api/interests', {
      method: 'POST',
      body: JSON.stringify({ ...data, action: 'remove' as const }),
    }),
  parse: (data: { url?: string; imageBase64?: string; mimeType?: string }) =>
    request<ApiParseResponse>('/api/parse', { method: 'POST', body: JSON.stringify(data) }),
  verifyAdmin: () => request<{ ok: boolean }>('/api/admin/verify'),
  adminImport: (rows: ParsedImportRow[]) =>
    request<{
      imported: number
      registrationsCreated: number
      skipped: number
      failed: Array<{ title: string; error: string }>
    }>('/api/admin/import', { method: 'POST', body: JSON.stringify({ rows }) }),
}

export function getEventUrl(id: string): string {
  if (typeof window === 'undefined') return `/event/${id}`
  return `${window.location.origin}/event/${id}`
}

export function getCancelUrl(token: string): string {
  if (typeof window === 'undefined') return `/cancel/${token}`
  return `${window.location.origin}/cancel/${token}`
}
