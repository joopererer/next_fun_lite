import { auth, currentUser } from '@clerk/nextjs/server'
import type { EnvConfig, Profile } from '@/shared/types'
import { withProfileDefaults } from '@/shared/profileDefaults'
import { createStorageAdapter } from '@/server/storage'
import { errorResponse, jsonResponse, parseBody } from '../lib/utils'

function mapProfile(row: Profile): Profile {
  return withProfileDefaults(row)
}

export async function handleGetProfile(_request: Request, env: EnvConfig): Promise<Response> {
  const { userId } = await auth()
  if (!userId) return errorResponse('Unauthorized', 401)

  const storage = createStorageAdapter(env)
  const profile = await storage.getProfile(userId)
  if (!profile) return jsonResponse(null)
  return jsonResponse(mapProfile(profile))
}

export async function handleUpsertProfile(request: Request, env: EnvConfig): Promise<Response> {
  const { userId } = await auth()
  if (!userId) return errorResponse('Unauthorized', 401)

  const body = await parseBody<{
    nickname?: string
    wechat?: string
    notificationEmail?: string
    notifyRegistrationChange?: boolean
    notifyProposalRecruiting?: boolean
    notifyNewRecruit?: boolean
  }>(request)

  const user = await currentUser()
  const email = user?.emailAddresses[0]?.emailAddress
  const defaultNickname =
    user?.fullName?.trim() ||
    user?.firstName?.trim() ||
    email ||
    '用户'
  const nickname = body.nickname?.trim() || defaultNickname

  const storage = createStorageAdapter(env)
  const existing = await storage.getProfile(userId)
  const profile = await storage.upsertProfile({
    id: userId,
    nickname,
    ...(body.wechat !== undefined ? { wechat: body.wechat.trim() || undefined } : {}),
    email: email ?? existing?.email,
    ...(body.notificationEmail !== undefined
      ? { notificationEmail: body.notificationEmail.trim() || undefined }
      : {}),
    ...(body.notifyRegistrationChange !== undefined
      ? { notifyRegistrationChange: body.notifyRegistrationChange }
      : {}),
    ...(body.notifyProposalRecruiting !== undefined
      ? { notifyProposalRecruiting: body.notifyProposalRecruiting }
      : {}),
    ...(body.notifyNewRecruit !== undefined ? { notifyNewRecruit: body.notifyNewRecruit } : {}),
  })

  return jsonResponse(mapProfile(profile))
}

export async function getProfileForUser(userId: string, env: EnvConfig): Promise<Profile | null> {
  const storage = createStorageAdapter(env)
  const profile = await storage.getProfile(userId)
  if (!profile) return null
  return mapProfile(profile)
}
