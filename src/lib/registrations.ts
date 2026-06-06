const REGISTRATIONS_KEY = 'nfl_registrations'

export function getRegistrationIds(): string[] {
  try {
    const raw = localStorage.getItem(REGISTRATIONS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : []
  } catch {
    return []
  }
}

export function addRegistrationId(activityId: string): void {
  const existing = getRegistrationIds()
  if (existing.includes(activityId)) return
  localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify([...existing, activityId]))
}

export function removeRegistrationId(activityId: string): void {
  const existing = getRegistrationIds().filter((id) => id !== activityId)
  localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(existing))
}
