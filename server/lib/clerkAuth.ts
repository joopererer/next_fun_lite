import { auth, currentUser } from '@clerk/nextjs/server'

export async function getOptionalUserId(): Promise<string | null> {
  const { userId } = await auth()
  return userId
}

export async function requireUserId(): Promise<string | null> {
  const { userId } = await auth()
  return userId
}

export async function getClerkDisplayName(): Promise<string> {
  const user = await currentUser()
  if (!user) return '用户'
  return (
    user.fullName?.trim() ||
    user.firstName?.trim() ||
    user.emailAddresses[0]?.emailAddress ||
    '用户'
  )
}
