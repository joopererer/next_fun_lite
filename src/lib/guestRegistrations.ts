const GUEST_REGS_KEY = 'nfl_guest_regs'

export interface GuestRegistrationRecord {
  activityId: string
  cancelToken: string
  name: string
  participantCount: number
  registeredAt: string
}

export function getGuestRegistrations(): GuestRegistrationRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(GUEST_REGS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (r): r is GuestRegistrationRecord =>
        typeof r === 'object' &&
        r != null &&
        typeof (r as GuestRegistrationRecord).activityId === 'string' &&
        typeof (r as GuestRegistrationRecord).cancelToken === 'string',
    )
  } catch {
    return []
  }
}

export function saveGuestRegistration(record: GuestRegistrationRecord): void {
  const existing = getGuestRegistrations().filter((r) => r.activityId !== record.activityId)
  localStorage.setItem(GUEST_REGS_KEY, JSON.stringify([...existing, record]))
}

export function removeGuestRegistration(activityId: string): void {
  const existing = getGuestRegistrations().filter((r) => r.activityId !== activityId)
  localStorage.setItem(GUEST_REGS_KEY, JSON.stringify(existing))
}

export function getGuestRegistrationByToken(token: string): GuestRegistrationRecord | null {
  return getGuestRegistrations().find((r) => r.cancelToken === token) ?? null
}
