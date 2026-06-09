import { clerkClient } from '@clerk/nextjs/server'
import type { EnvConfig } from '@/shared/types'
import { createStorageAdapter } from '@/server/storage'

export async function getNotificationEmail(
  env: EnvConfig,
  userId?: string,
  fallbackEmail?: string,
): Promise<string | null> {
  if (!userId) return fallbackEmail?.trim() || null

  const storage = createStorageAdapter(env)
  const profile = await storage.getProfile(userId)
  if (profile?.notificationEmail?.trim()) return profile.notificationEmail.trim()

  try {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const clerkEmail = user.emailAddresses[0]?.emailAddress
    if (clerkEmail) return clerkEmail
  } catch (err) {
    console.error('Failed to fetch Clerk email:', err)
  }

  if (profile?.email?.trim()) return profile.email.trim()
  return fallbackEmail?.trim() || null
}
