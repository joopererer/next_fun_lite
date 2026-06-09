import type { Profile } from './types'

export const DEFAULT_NOTIFICATION_PREFS = {
  notifyRegistrationChange: true,
  notifyProposalRecruiting: true,
  notifyNewRecruit: false,
} as const

export function withProfileDefaults(
  partial: Partial<Profile> & { id: string; nickname: string },
): Profile {
  const now = new Date().toISOString()
  return {
    wechat: undefined,
    email: undefined,
    notificationEmail: undefined,
    ...DEFAULT_NOTIFICATION_PREFS,
    createdAt: now,
    updatedAt: now,
    ...partial,
  }
}
