import { auth, currentUser } from '@clerk/nextjs/server'
import { getSupabaseClient } from '@/lib/supabase'
import type { EnvConfig, Profile } from '@/shared/types'
import { errorResponse, jsonResponse, parseBody } from '../lib/utils'

function mapProfile(row: Record<string, unknown>): Profile {
  return {
    id: String(row.id),
    nickname: String(row.nickname),
    wechat: row.wechat ? String(row.wechat) : undefined,
    email: row.email ? String(row.email) : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  }
}

export async function handleGetProfile(_request: Request, env: EnvConfig): Promise<Response> {
  const { userId } = await auth()
  if (!userId) return errorResponse('Unauthorized', 401)

  const { data, error } = await getSupabaseClient(env)
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) return errorResponse(error.message, 500)
  if (!data) return jsonResponse(null)
  return jsonResponse(mapProfile(data as Record<string, unknown>))
}

export async function handleUpsertProfile(request: Request, env: EnvConfig): Promise<Response> {
  const { userId } = await auth()
  if (!userId) return errorResponse('Unauthorized', 401)

  const body = await parseBody<{ nickname?: string; wechat?: string }>(request)
  if (!body.nickname?.trim()) return errorResponse('Missing nickname')

  const user = await currentUser()
  const email = user?.emailAddresses[0]?.emailAddress

  const { data, error } = await getSupabaseClient(env)
    .from('profiles')
    .upsert({
      id: userId,
      nickname: body.nickname.trim(),
      wechat: body.wechat?.trim() || null,
      email: email ?? null,
    })
    .select()
    .single()

  if (error) return errorResponse(error.message, 500)
  return jsonResponse(mapProfile(data as Record<string, unknown>))
}

export async function getProfileForUser(userId: string, env: EnvConfig): Promise<Profile | null> {
  const { data } = await getSupabaseClient(env)
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  if (!data) return null
  return mapProfile(data as Record<string, unknown>)
}
