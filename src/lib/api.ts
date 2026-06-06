import type {
  Activity,
  ActivityWithCount,
  ApiParseResponse,
  Interest,
  InterestMutationResult,
  Profile,
  RecruitmentResponse,
  Registration,
  RegistrationMutationResult,
} from '@/shared/types'
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
  saveProfile: (data: { nickname: string; wechat?: string }) =>
    request<Profile>('/api/profile', { method: 'POST', body: JSON.stringify(data) }),
  createRegistration: (data: {
    activityId: string
    name?: string
    wechat?: string
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
}

export function getEventUrl(id: string): string {
  if (typeof window === 'undefined') return `/event/${id}`
  return `${window.location.origin}/event/${id}`
}

export function getCancelUrl(token: string): string {
  if (typeof window === 'undefined') return `/cancel/${token}`
  return `${window.location.origin}/cancel/${token}`
}
