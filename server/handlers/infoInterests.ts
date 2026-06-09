import type { EnvConfig } from '@/shared/types'
import { createStorageAdapter } from '@/server/storage'
import { getOptionalUserId } from '../lib/clerkAuth'
import { errorResponse, jsonResponse, parseBody } from '../lib/utils'

export async function handleCreateInfoInterest(request: Request, env: EnvConfig): Promise<Response> {
  const storage = createStorageAdapter(env)
  const body = await parseBody<{ activityId?: string; email?: string }>(request)
  const activityId = body.activityId?.trim()
  if (!activityId) return errorResponse('Missing activityId')

  const activity = await storage.getActivity(activityId)
  if (!activity || activity.postType !== 'info') {
    return errorResponse('Info post not found', 404)
  }

  const userId = await getOptionalUserId()
  const deviceId = request.headers.get('X-Device-Id')?.trim() || undefined

  if (userId) {
    const existing = await storage.findInfoInterestByUserId(activityId, userId)
    if (existing) return jsonResponse(existing)
    const interest = await storage.createInfoInterest({ activityId, userId })
    return jsonResponse(interest, 201)
  }

  const email = body.email?.trim()
  if (!email) return errorResponse('Email required for guest reminder')

  const existingByEmail = await storage.findInfoInterestByEmail(activityId, email)
  if (existingByEmail) return jsonResponse(existingByEmail)

  if (deviceId) {
    const existingByDevice = await storage.findInfoInterestByDeviceId(activityId, deviceId)
    if (existingByDevice) return jsonResponse(existingByDevice)
  }

  const interest = await storage.createInfoInterest({ activityId, email, deviceId })
  return jsonResponse(interest, 201)
}

export async function handleDeleteInfoInterest(request: Request, env: EnvConfig): Promise<Response> {
  const storage = createStorageAdapter(env)
  const body = await parseBody<{ activityId?: string }>(request)
  const activityId = body.activityId?.trim()
  if (!activityId) return errorResponse('Missing activityId')

  const userId = await getOptionalUserId()
  const deviceId = request.headers.get('X-Device-Id')?.trim() || undefined

  if (userId) {
    const existing = await storage.findInfoInterestByUserId(activityId, userId)
    if (!existing) return errorResponse('Not found', 404)
    await storage.deleteInfoInterest(existing.id)
    return jsonResponse({ ok: true })
  }

  if (deviceId) {
    const existing = await storage.findInfoInterestByDeviceId(activityId, deviceId)
    if (!existing) return errorResponse('Not found', 404)
    await storage.deleteInfoInterest(existing.id)
    return jsonResponse({ ok: true })
  }

  return errorResponse('Unauthorized', 401)
}

export async function handleGetInfoInterestStatus(
  request: Request,
  env: EnvConfig,
  activityId: string,
): Promise<Response> {
  const storage = createStorageAdapter(env)
  const userId = await getOptionalUserId()
  const deviceId = request.headers.get('X-Device-Id')?.trim() || undefined

  if (userId) {
    const existing = await storage.findInfoInterestByUserId(activityId, userId)
    return jsonResponse({ subscribed: Boolean(existing) })
  }

  if (deviceId) {
    const existing = await storage.findInfoInterestByDeviceId(activityId, deviceId)
    return jsonResponse({ subscribed: Boolean(existing) })
  }

  return jsonResponse({ subscribed: false })
}
