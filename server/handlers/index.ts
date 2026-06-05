import type { Activity, ActivityWithCount, EnvConfig, InterestMutationResult } from '../../shared/types'
import { createStorageAdapter } from '../storage'
import type { StorageAdapter } from '../storage/types'
import {
  checkAdminAuth,
  errorResponse,
  getRegisteredCount,
  jsonResponse,
  parseBody,
} from '../lib/utils'

async function enrichActivity(storage: StorageAdapter, activity: Activity): Promise<ActivityWithCount> {
  const registeredCount = await getRegisteredCount(storage, activity.id)
  return { ...activity, registeredCount }
}

export async function handleGetActivities(_request: Request, env: EnvConfig): Promise<Response> {
  const storage = createStorageAdapter(env)
  const activities = await storage.getActivities()
  const enriched = await Promise.all(activities.map((a) => enrichActivity(storage, a)))
  return jsonResponse(enriched)
}

export async function handleGetActivity(request: Request, env: EnvConfig, id: string): Promise<Response> {
  const storage = createStorageAdapter(env)
  const activity = await storage.getActivity(id)
  if (!activity) return errorResponse('Activity not found', 404)
  return jsonResponse(await enrichActivity(storage, activity))
}

export async function handleCreateActivity(request: Request, env: EnvConfig, isPublic = false): Promise<Response> {
  const storage = createStorageAdapter(env)
  const body = await parseBody<Partial<Activity>>(request)

  if (isPublic) {
    const activity = await storage.createActivity({
      title: body.title ?? '',
      description: body.description ?? '',
      date: body.date ?? null,
      location: body.location ?? '',
      maxParticipants: null,
      fee: body.fee ?? '',
      notes: body.notes ?? '',
      organizerName: body.organizerName ?? '',
      organizerWechat: body.organizerWechat ?? '',
      sourceUrl: body.sourceUrl ?? '',
      status: 'proposed',
      category: body.category ?? 'other',
      interestedCount: 0,
    })
    return jsonResponse(activity, 201)
  }

  if (!checkAdminAuth(request, env)) return errorResponse('Unauthorized', 401)

  const activity = await storage.createActivity({
    title: body.title ?? '',
    description: body.description ?? '',
    date: body.date ?? null,
    location: body.location ?? '',
    maxParticipants: body.maxParticipants ?? null,
    fee: body.fee ?? '',
    notes: body.notes ?? '',
    organizerName: body.organizerName ?? '',
    organizerWechat: body.organizerWechat ?? '',
    sourceUrl: body.sourceUrl ?? '',
    status: body.status ?? 'proposed',
    category: body.category ?? 'other',
    interestedCount: body.interestedCount ?? 0,
  })
  return jsonResponse(activity, 201)
}

export async function handleUpdateActivity(request: Request, env: EnvConfig, id: string): Promise<Response> {
  if (!checkAdminAuth(request, env)) return errorResponse('Unauthorized', 401)
  const storage = createStorageAdapter(env)
  const body = await parseBody<Partial<Activity>>(request)
  try {
    const activity = await storage.updateActivity(id, body)
    return jsonResponse(await enrichActivity(storage, activity))
  } catch {
    return errorResponse('Activity not found', 404)
  }
}

export async function handleDeleteActivity(request: Request, env: EnvConfig, id: string): Promise<Response> {
  if (!checkAdminAuth(request, env)) return errorResponse('Unauthorized', 401)
  const storage = createStorageAdapter(env)
  await storage.deleteActivity(id)
  return jsonResponse({ ok: true })
}

export async function handleGetRegistrations(request: Request, env: EnvConfig, activityId: string): Promise<Response> {
  if (!checkAdminAuth(request, env)) return errorResponse('Unauthorized', 401)
  const storage = createStorageAdapter(env)
  const registrations = await storage.getRegistrations(activityId)
  return jsonResponse(registrations)
}

export async function handleCreateRegistration(request: Request, env: EnvConfig): Promise<Response> {
  const storage = createStorageAdapter(env)
  const body = await parseBody<{
    activityId: string
    name: string
    wechat: string
    participantCount?: number
    note?: string
  }>(request)

  if (!body.activityId || !body.name || !body.wechat) {
    return errorResponse('Missing required fields')
  }

  const activity = await storage.getActivity(body.activityId)
  if (!activity) return errorResponse('Activity not found', 404)
  if (activity.status === 'ended') return errorResponse('Activity has ended')
  if (activity.status !== 'recruiting') return errorResponse('Activity is not open for registration')

  const participantCount = body.participantCount ?? 1
  const currentCount = await getRegisteredCount(storage, body.activityId)

  if (activity.maxParticipants !== null && currentCount + participantCount > activity.maxParticipants) {
    return errorResponse('Capacity exceeded')
  }

  const registration = await storage.createRegistration({
    activityId: body.activityId,
    name: body.name,
    wechat: body.wechat,
    participantCount,
    note: body.note ?? '',
  })
  return jsonResponse(registration, 201)
}

export async function handleGetInterests(_request: Request, env: EnvConfig, activityId: string): Promise<Response> {
  const storage = createStorageAdapter(env)
  const interests = await storage.getInterests(activityId)
  return jsonResponse(interests)
}

export async function handleMutateInterest(request: Request, env: EnvConfig): Promise<Response> {
  const storage = createStorageAdapter(env)
  const body = await parseBody<{
    activityId: string
    name?: string
    wechat: string
    action?: 'remove'
  }>(request)

  if (!body.activityId || !body.wechat) {
    return errorResponse('Missing required fields')
  }

  const activity = await storage.getActivity(body.activityId)
  if (!activity) return errorResponse('Activity not found', 404)
  if (activity.status !== 'proposed') return errorResponse('Can only express interest in proposals')

  if (body.action === 'remove') {
    const result = await storage.deleteInterest(body.activityId, body.wechat)
    return jsonResponse(result)
  }

  if (!body.name) {
    return errorResponse('Missing required fields')
  }

  const existing = await storage.findInterest(body.activityId, body.wechat)
  if (existing) {
    const count = (await storage.getActivity(body.activityId))?.interestedCount ?? 0
    return jsonResponse({ interest: existing, interestedCount: count } satisfies InterestMutationResult)
  }

  const result = await storage.createInterest({
    activityId: body.activityId,
    name: body.name,
    wechat: body.wechat,
  })
  return jsonResponse(result, 201)
}

export async function handleDeleteInterest(request: Request, env: EnvConfig): Promise<Response> {
  const storage = createStorageAdapter(env)
  const url = new URL(request.url)

  let body: { activityId?: string; wechat?: string } = {}
  try {
    body = await parseBody<{ activityId?: string; wechat?: string }>(request)
  } catch {
    // DELETE body may be empty in some environments; fall back to query params
  }

  const activityId = body.activityId ?? url.searchParams.get('activityId') ?? undefined
  const wechat = body.wechat ?? url.searchParams.get('wechat') ?? undefined

  if (!activityId || !wechat) {
    return errorResponse('Missing required fields')
  }

  const activity = await storage.getActivity(activityId)
  if (!activity) return errorResponse('Activity not found', 404)

  const result = await storage.deleteInterest(activityId, wechat)
  return jsonResponse(result)
}
