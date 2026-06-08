import type { RegistrantContactType } from '../../shared/types'

const STORAGE_KEY = 'nfl_contact_prefs'

export interface ContactPrefs {
  contactType: RegistrantContactType
  contactValue: string
  contactLabel?: string
}

export function loadContactPrefs(): ContactPrefs | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as ContactPrefs
  } catch {
    return null
  }
}

export function saveContactPrefs(prefs: ContactPrefs): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
}
