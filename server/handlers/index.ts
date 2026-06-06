import type {
  Activity,
  ActivityWithCount,
  CreateRecruitmentBody,
  EnvConfig,
  InterestMutationResult,
} from '../../shared/types'
import { isTerminalStatus, normalizeActivityStatus } from '../../shared/activityStatus'
import {
  buildAdminCreatePayload,
  buildProposalPayload,
  buildRecruitmentPayload,
} from '../lib/activityPayload'
import { createStorageAdapter } from '../storage'
import type { StorageAdapter } from '../storage/types'
import {
  checkAdminAuth,
  errorResponse,
  getRegisteredCount,
  jsonResponse,
  parseBody,
} from '../lib/utils'

function getEventUrl(env: EnvConfig, activityId: string): string {
  const base = env.SITE_URL?.replace(/\/$/, '') ?? ''
  return base ? `${base}/event/${activityId}` : `/event/${activityId}`
}

async function enrichActivity(storage: StorageAdapter, activity: Activity): Promise<ActivityWithCount> {
  const registeredCount = await getRegisteredCount(storage, activity.id)
  return { ...activity, status: normalizeActivityStatus(activity.status), registeredCount }
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
    const activity = await storage.createActivity(buildProposalPayload(body))
    return jsonResponse(activity, 201)
  }

  if (!checkAdminAuth(request, env)) return errorResponse('Unauthorized', 401)

  const activity = await storage.createActivity(buildAdminCreatePayload(body))
  return jsonResponse(activity, 201)
}

export async function handleCreateRecruitment(request: Request, env: EnvConfig): Promise<Response> {
  const storage = createStorageAdapter(env)
  const body = await parseBody<CreateRecruitmentBody>(request)
  let payload: Partial<Activity>
  try {
    payload = buildRecruitmentPayload(body)
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : 'Invalid payload')
  }

  if (!payload.title || !payload.category || !payload.date || !payload.location) {
    return errorResponse('Missing required fields: title, category, date, location')
  }
  if (!payload.organizerName || !payload.organizerWechat) {
    return errorResponse('Missing required fields: organizerName, organizerWechat')
  }

  let activity: Activity

  if (body.sourceProposalId) {
    const proposal = await storage.getActivity(body.sourceProposalId)
    if (!proposal) return errorResponse('Proposal not found', 404)
    if (proposal.status !== 'proposed') return errorResponse('Activity is not a proposal')
  }

  activity = await storage.createActivity({
    ...(payload as Omit<Activity, 'id' | 'createdAt'>),
    interestedCount: 0,
    sourceProposalId: body.sourceProposalId,
  })

  if (body.sourceProposalId) {
    await storage.addLinkedRecruit(body.sourceProposalId, activity.id)
  }

  return jsonResponse(
    { activity, eventUrl: getEventUrl(env, activity.id) },
    201,
  )
}

export async function handleGetActivitiesByIds(request: Request, env: EnvConfig): Promise<Response> {
  const idsParam = new URL(request.url).searchParams.get('ids')
  if (!idsParam) return errorResponse('Missing ids parameter')
  const ids = idsParam.split(',').map((s) => s.trim()).filter(Boolean)
  if (ids.length === 0) return jsonResponse([])

  const storage = createStorageAdapter(env)
  const activities = await storage.getActivitiesByIds(ids)
  const enriched = await Promise.all(activities.map((a) => enrichActivity(storage, a)))
  return jsonResponse(enriched)
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

export async function handleGetMyRegistration(request: Request, env: EnvConfig, activityId: string): Promise<Response> {
  const wechat = new URL(request.url).searchParams.get('wechat')
  if (!wechat) return errorResponse('Missing wechat')
  const storage = createStorageAdapter(env)
  const registration = await storage.findRegistration(activityId, wechat)
  const registeredCount = await getRegisteredCount(storage, activityId)
  return jsonResponse({ registration, registeredCount })
}

export async function handleCreateRegistration(request: Request, env: EnvConfig): Promise<Response> {
  const storage = createStorageAdapter(env)
  const body = await parseBody<{
    activityId: string
    name?: string
    wechat: string
    participantCount?: number
    note?: string
    action?: 'remove'
  }>(request)

  if (!body.activityId || !body.wechat) {
    return errorResponse('Missing required fields')
  }

  if (body.action === 'remove') {
    const activity = await storage.getActivity(body.activityId)
    if (!activity) return errorResponse('Activity not found', 404)
    const result = await storage.deleteRegistration(body.activityId, body.wechat)
    return jsonResponse(result)
  }

  if (!body.name) {
    return errorResponse('Missing required fields')
  }

  const activity = await storage.getActivity(body.activityId)
  if (!activity) return errorResponse('Activity not found', 404)
  const status = normalizeActivityStatus(activity.status)
  if (isTerminalStatus(status)) return errorResponse('Activity has ended')
  if (status !== 'recruiting') return errorResponse('Activity is not open for registration')

  const existing = await storage.findRegistration(body.activityId, body.wechat)
  if (existing) return errorResponse('Already registered', 409)

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
  const registeredCount = await getRegisteredCount(storage, body.activityId)
  return jsonResponse({ registration, registeredCount }, 201)
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
