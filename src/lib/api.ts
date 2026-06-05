import type { Activity, ActivityWithCount, ApiParseResponse, InterestMutationResult, Registration } from '../../shared/types'

const ADMIN_KEY = 'nfl_admin_password'

export function getAdminPassword(): string | null {
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

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...adminHeaders(),
      ...options.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((err as { error?: string }).error ?? 'Request failed')
  }
  return res.json() as Promise<T>
}

export const api = {
  getActivities: () => request<ActivityWithCount[]>('/api/activities'),
  getActivity: (id: string) => request<ActivityWithCount>(`/api/activities/${id}`),
  createProposal: (data: Partial<Activity>) =>
    request<Activity>('/api/proposals', { method: 'POST', body: JSON.stringify(data) }),
  createActivity: (data: Partial<Activity>) =>
    request<Activity>('/api/activities', { method: 'POST', body: JSON.stringify(data) }),
  updateActivity: (id: string, data: Partial<Activity>) =>
    request<ActivityWithCount>(`/api/activities/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteActivity: (id: string) =>
    request<{ ok: boolean }>(`/api/activities/${id}`, { method: 'DELETE' }),
  getRegistrations: (activityId: string) =>
    request<Registration[]>(`/api/activities/${activityId}/registrations`),
  createRegistration: (data: {
    activityId: string
    name: string
    wechat: string
    participantCount: number
    note: string
  }) => request<Registration>('/api/registrations', { method: 'POST', body: JSON.stringify(data) }),
  createInterest: (data: { activityId: string; name: string; wechat: string }) =>
    request<InterestMutationResult>('/api/interests', { method: 'POST', body: JSON.stringify(data) }),
  deleteInterest: (data: { activityId: string; wechat: string }) =>
    request<InterestMutationResult>('/api/interests', { method: 'DELETE', body: JSON.stringify(data) }),
  parse: (data: { url?: string; imageBase64?: string; mimeType?: string }) =>
    request<ApiParseResponse>('/api/parse', { method: 'POST', body: JSON.stringify(data) }),
}

export function getEventUrl(id: string): string {
  const base = import.meta.env.VITE_SITE_URL || window.location.origin
  return `${base}/event/${id}`
}
