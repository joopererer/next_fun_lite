import type {
  Activity,
  ActivityWithCount,
  CreateRecruitmentBody,
  EnvConfig,
  InterestMutationResult,
  Registration,
} from '../../shared/types'
import { findSimilarProposals } from '../../shared/activityDedupe'
import type { ParsedImportRow } from '../../shared/excelImport'
import { isEndTimeInPast, PAST_END_TIME_MESSAGE } from '../../shared/validateSchedule'
import { canRegister, isProposalExpired } from '../../shared/activityPhase'
import { isTerminalStatus, normalizeActivityStatus } from '../../shared/activityStatus'
import { enrichActivity } from '../lib/enrichActivity'
import {
  buildAdminCreatePayload,
  buildInfoPayload,
  buildProposalPayload,
  buildRecruitmentPayload,
} from '../lib/activityPayload'
import { autoEndExpiredRecruitments, getActivityAfterLifecycle } from '../lib/activityLifecycle'
import { createStorageAdapter } from '../storage'
import type { StorageAdapter } from '../storage/types'
import { getOptionalUserId, getClerkDisplayName } from '../lib/clerkAuth'
import { getProfileForUser } from './profile'
import {
  checkAdminAuth,
  errorResponse,
  getRegisteredCount,
  jsonResponse,
  parseBody,
} from '../lib/utils'
import { nanoid } from 'nanoid'
import { clerkClient } from '@clerk/nextjs/server'

function getEventUrl(env: EnvConfig, activityId: string): string {
  const base = env.SITE_URL?.replace(/\/$/, '') ?? ''
  return base ? `${base}/event/${activityId}` : `/event/${activityId}`
}

export async function handleGetActivities(_request: Request, env: EnvConfig): Promise<Response> {
  const storage = createStorageAdapter(env)
  await autoEndExpiredRecruitments(storage)
  const activities = await storage.getActivities()
  const enriched = await Promise.all(activities.map((a) => enrichActivity(storage, a)))
  return jsonResponse(enriched)
}

export async function handleGetActivity(request: Request, env: EnvConfig, id: string): Promise<Response> {
  const storage = createStorageAdapter(env)
  let activity = await storage.getActivity(id)
  if (!activity) return errorResponse('Activity not found', 404)
  activity = await getActivityAfterLifecycle(storage, activity)
  return jsonResponse(await enrichActivity(storage, activity))
}

export async function handleCreateActivity(request: Request, env: EnvConfig, isPublic = false): Promise<Response> {
  const storage = createStorageAdapter(env)
  const body = await parseBody<Partial<Activity>>(request)

  if (isPublic) {
    const userId = await getOptionalUserId()
    if (!userId) return errorResponse('Unauthorized', 401)

    if (isEndTimeInPast(body.dateEnd)) {
      return errorResponse(PAST_END_TIME_MESSAGE, 400)
    }

    let payload = buildProposalPayload(body)
    const displayName = await getClerkDisplayName()
    const profile = await getProfileForUser(userId, env)
    payload = {
      ...payload,
      organizerName: payload.organizerName || profile?.nickname || displayName,
      organizerWechat: payload.organizerWechat || profile?.wechat || '',
      organizerId: userId,
    }
    const activity = await storage.createActivity(payload)
    return jsonResponse(activity, 201)
  }

  if (!checkAdminAuth(request, env)) return errorResponse('Unauthorized', 401)

  const activity = await storage.createActivity(buildAdminCreatePayload(body))
  return jsonResponse(activity, 201)
}

export async function handleCreateRecruitment(request: Request, env: EnvConfig): Promise<Response> {
  const storage = createStorageAdapter(env)
  const body = await parseBody<CreateRecruitmentBody>(request)
  const userId = await getOptionalUserId()
  let payload: Partial<Activity>
  try {
    payload = buildRecruitmentPayload(body)
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : 'Invalid payload')
  }

  if (isEndTimeInPast(payload.dateEnd)) {
    return errorResponse(PAST_END_TIME_MESSAGE, 400)
  }

  if (!payload.title || !payload.category || !payload.date || !payload.location) {
    return errorResponse('Missing required fields: title, category, date, location')
  }

  if (userId) {
    const profile = await getProfileForUser(userId, env)
    const displayName = await getClerkDisplayName()
    if (!payload.organizerName) {
      payload.organizerName = displayName
    }
    if (!payload.organizerWechat) {
      payload.organizerWechat = profile?.wechat ?? ''
    }
    payload.organizerId = userId
  } else {
    return errorResponse('Unauthorized', 401)
  }

  if (!payload.organizerName) {
    return errorResponse('Missing required fields: organizerName')
  }
  if (!payload.organizerWechat) {
    payload.organizerWechat = '—'
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

  void import('@/server/notifications/triggers').then(({ dispatchRecruitmentNotifications }) =>
    dispatchRecruitmentNotifications(env, activity, body.sourceProposalId).catch(console.error),
  )

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
  if (body.dateEnd !== undefined && isEndTimeInPast(body.dateEnd)) {
    return errorResponse(PAST_END_TIME_MESSAGE, 400)
  }
  try {
    const before = await storage.getActivity(id)
    if (!before) return errorResponse('Activity not found', 404)
    const activity = await storage.updateActivity(id, body)
    void import('@/server/notifications/triggers').then(({ dispatchActivityNotifications }) =>
      dispatchActivityNotifications(env, before, activity).catch(console.error),
    )
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
  const storage = createStorageAdapter(env)
  const userId = await getOptionalUserId()
  let registration: Registration | null = null

  if (userId) {
    const registrations = await storage.getRegistrationsByUser(userId)
    registration = registrations.find((r) => r.activityId === activityId && !r.cancelledAt) ?? null
  } else {
    const wechat = new URL(request.url).searchParams.get('wechat')
    if (!wechat) return errorResponse('Missing wechat')
    registration = await storage.findRegistration(activityId, wechat)
  }

  const registeredCount = await getRegisteredCount(storage, activityId)
  return jsonResponse({ registration, registeredCount })
}

export async function handleGetMyRegistrations(_request: Request, env: EnvConfig): Promise<Response> {
  const userId = await getOptionalUserId()
  if (!userId) return errorResponse('Unauthorized', 401)

  const storage = createStorageAdapter(env)
  const registrations = await storage.getRegistrationsByUser(userId)
  const activityIds = registrations.map((r) => r.activityId)
  const activities = await storage.getActivitiesByIds(activityIds)
  const enriched = await Promise.all(activities.map((a) => enrichActivity(storage, a)))
  const registrationMap = Object.fromEntries(registrations.map((r) => [r.activityId, r]))
  return jsonResponse({ registrations: registrationMap, activities: enriched })
}

export async function handleCreateRegistration(request: Request, env: EnvConfig): Promise<Response> {
  const storage = createStorageAdapter(env)
  const userId = await getOptionalUserId()

  const body = await parseBody<{
    activityId: string
    name?: string
    wechat?: string
    contactType?: 'wechat' | 'email' | 'other'
    contactValue?: string
    contactLabel?: string
    participantCount?: number
    note?: string
    action?: 'remove'
  }>(request)

  if (!body.activityId) {
    return errorResponse('Missing required fields')
  }

  if (body.action === 'remove') {
    if (!userId) return errorResponse('Unauthorized', 401)
    const activity = await storage.getActivity(body.activityId)
    if (!activity) return errorResponse('Activity not found', 404)

    const registrations = await storage.getRegistrationsByUser(userId)
    const existing = registrations.find((r) => r.activityId === body.activityId && !r.cancelledAt)
    if (!existing) return errorResponse('Not registered', 404)
    const result = await storage.cancelRegistration(existing.id, 'user')
    return jsonResponse(result)
  }

  let name = body.name?.trim() ?? ''
  const contactType = body.contactType ?? (body.wechat ? 'wechat' : 'wechat')
  let contactValue = body.contactValue?.trim() ?? body.wechat?.trim() ?? ''
  const contactLabel = body.contactLabel?.trim() || undefined
  let wechat = contactType === 'wechat' ? contactValue : (body.wechat?.trim() ?? '')
  let cancelToken: string | undefined

  if (userId) {
    const profile = await getProfileForUser(userId, env)
    if (!name) name = profile?.nickname || (await getClerkDisplayName())
    if (!contactValue) {
      if (contactType === 'wechat') contactValue = profile?.wechat ?? ''
      else if (contactType === 'email') contactValue = profile?.email ?? ''
    }
    if (contactType === 'wechat') wechat = contactValue

    const userRegs = await storage.getRegistrationsByUser(userId)
    if (userRegs.some((r) => r.activityId === body.activityId && !r.cancelledAt)) {
      return errorResponse('Already registered', 409)
    }
  } else {
    if (!name || !contactValue) {
      return errorResponse('Missing required fields: name, contact')
    }
    if (contactType === 'wechat') {
      const existing = await storage.findRegistrationByNameAndWechat(body.activityId, name, contactValue)
      if (existing) return errorResponse('Already registered', 409)
      wechat = contactValue
    }
    cancelToken = nanoid(16)
  }

  const activity = await storage.getActivity(body.activityId)
  if (!activity) return errorResponse('Activity not found', 404)
  const status = normalizeActivityStatus(activity.status)
  if (isTerminalStatus(status)) return errorResponse('Activity has ended')
  if (status !== 'recruiting') return errorResponse('Activity is not open for registration')

  const currentCount = await getRegisteredCount(storage, body.activityId)
  if (!canRegister({ ...activity, registeredCount: currentCount })) {
    return errorResponse('Registration is closed', 409)
  }

  const participantCount = body.participantCount ?? 1

  if (activity.maxParticipants !== null && currentCount + participantCount > activity.maxParticipants) {
    return errorResponse('Capacity exceeded')
  }

  const registration = await storage.createRegistration({
    activityId: body.activityId,
    userId: userId ?? undefined,
    name,
    wechat: wechat || (contactType === 'wechat' ? contactValue : '—'),
    contactType,
    contactValue,
    contactLabel,
    participantCount,
    note: body.note ?? '',
    cancelToken,
  })
  const registeredCount = await getRegisteredCount(storage, body.activityId)
  return jsonResponse({ success: true, registration, registeredCount, cancelToken }, 201)
}

export async function handleDeleteRegistration(_request: Request, env: EnvConfig, id: string): Promise<Response> {
  const userId = await getOptionalUserId()
  if (!userId) return errorResponse('Unauthorized', 401)

  const storage = createStorageAdapter(env)
  const registration = await storage.getRegistrationById(id)
  if (!registration) return errorResponse('Registration not found', 404)
  if (registration.userId !== userId) return errorResponse('Forbidden', 403)
  if (registration.cancelledAt) return errorResponse('Already cancelled', 409)

  const result = await storage.cancelRegistration(id, 'user')
  return jsonResponse(result)
}

export async function handleGetRegistrationByToken(_request: Request, env: EnvConfig, token: string): Promise<Response> {
  const storage = createStorageAdapter(env)
  const registration = await storage.getRegistrationByToken(token)
  if (!registration) return errorResponse('Invalid token', 404)

  const activity = await storage.getActivity(registration.activityId)
  if (!activity) return errorResponse('Activity not found', 404)

  return jsonResponse({ registration, activity })
}

export async function handleCancelByToken(_request: Request, env: EnvConfig, token: string): Promise<Response> {
  const storage = createStorageAdapter(env)
  const registration = await storage.getRegistrationByToken(token)
  if (!registration) return errorResponse('Invalid token', 404)
  if (registration.cancelledAt) return errorResponse('Already cancelled', 409)

  const result = await storage.cancelRegistration(registration.id, 'user')
  return jsonResponse({ success: true, ...result })
}

export async function handleGetRegistrationSummary(_request: Request, env: EnvConfig, activityId: string): Promise<Response> {
  const storage = createStorageAdapter(env)
  const active = await storage.getActiveRegistrations(activityId)
  const previews = await Promise.all(
    active.slice(0, 5).map(async (r) => {
      let avatarUrl: string | null = null
      if (r.userId) {
        try {
          const client = await clerkClient()
          const user = await client.users.getUser(r.userId)
          avatarUrl = user.imageUrl ?? null
        } catch {
          avatarUrl = null
        }
      }
      return { name: r.name, avatarUrl }
    }),
  )
  return jsonResponse({ total: active.length, previews })
}

export async function handleGetInterests(_request: Request, env: EnvConfig, activityId: string): Promise<Response> {
  const storage = createStorageAdapter(env)
  const interests = await storage.getInterests(activityId)
  return jsonResponse(interests)
}

export async function handleMutateInterest(request: Request, env: EnvConfig): Promise<Response> {
  const storage = createStorageAdapter(env)
  const userId = await getOptionalUserId()
  const deviceId = request.headers.get('X-Device-Id')?.trim() || undefined
  const body = await parseBody<{
    activityId: string
    name?: string
    wechat?: string
    action?: 'remove'
  }>(request)

  if (!body.activityId) {
    return errorResponse('Missing required fields')
  }

  if (!userId && !deviceId) return errorResponse('Unauthorized', 401)

  const activity = await storage.getActivity(body.activityId)
  if (!activity) return errorResponse('Activity not found', 404)
  if (activity.status !== 'proposed') return errorResponse('Can only express interest in proposals')
  if (isProposalExpired(activity)) return errorResponse('Proposal has expired', 409)

  if (body.action === 'remove') {
    const result = userId
      ? await storage.deleteInterestByUserId(body.activityId, userId)
      : await storage.deleteInterestByDeviceId(body.activityId, deviceId!)
    return jsonResponse(result)
  }

  if (userId) {
    const existing = await storage.findInterestByUserId(body.activityId, userId)
    if (existing) {
      const interests = await storage.getInterests(body.activityId)
      return jsonResponse({ interest: existing, interestedCount: interests.length } satisfies InterestMutationResult)
    }
    const result = await storage.createInterest({ activityId: body.activityId, userId })
    return jsonResponse(result, 201)
  }

  const existing = await storage.findInterestByDeviceId(body.activityId, deviceId!)
  if (existing) {
    const interests = await storage.getInterests(body.activityId)
    return jsonResponse({ interest: existing, interestedCount: interests.length } satisfies InterestMutationResult)
  }

  const result = await storage.createInterest({ activityId: body.activityId, deviceId })
  return jsonResponse(result, 201)
}

export async function handleDeleteInterest(request: Request, env: EnvConfig): Promise<Response> {
  const storage = createStorageAdapter(env)
  const userId = await getOptionalUserId()
  const deviceId = request.headers.get('X-Device-Id')?.trim() || undefined
  const url = new URL(request.url)

  let body: { activityId?: string; wechat?: string } = {}
  try {
    body = await parseBody<{ activityId?: string; wechat?: string }>(request)
  } catch {
    // DELETE body may be empty
  }

  const activityId = body.activityId ?? url.searchParams.get('activityId') ?? undefined

  if (!activityId) {
    return errorResponse('Missing required fields')
  }

  const activity = await storage.getActivity(activityId)
  if (!activity) return errorResponse('Activity not found', 404)

  if (!userId && !deviceId) return errorResponse('Unauthorized', 401)

  const result = userId
    ? await storage.deleteInterestByUserId(activityId, userId)
    : await storage.deleteInterestByDeviceId(activityId, deviceId!)
  return jsonResponse(result)
}

export async function handleFindSimilarProposals(request: Request, env: EnvConfig): Promise<Response> {
  const userId = await getOptionalUserId()
  if (!userId) return errorResponse('Unauthorized', 401)

  const url = new URL(request.url)
  const title = url.searchParams.get('title') ?? ''
  const location = url.searchParams.get('location') ?? undefined
  const sourceUrl = url.searchParams.get('sourceUrl') ?? undefined

  const storage = createStorageAdapter(env)
  const activities = await storage.getActivities()
  const proposals = activities.filter((a) => a.status === 'proposed' && a.postType !== 'info')
  const matches = findSimilarProposals(proposals, { title, location, sourceUrl })
  return jsonResponse({ matches })
}

export async function handleCreateInfo(request: Request, env: EnvConfig): Promise<Response> {
  const storage = createStorageAdapter(env)
  const body = await parseBody<Partial<Activity>>(request)

  if (!body.title?.trim()) {
    return errorResponse('Missing required field: title', 400)
  }
  if (body.infoDeadline && isEndTimeInPast(body.infoDeadline)) {
    return errorResponse(PAST_END_TIME_MESSAGE, 400)
  }
  if (body.infoStartTime && body.infoDeadline) {
    const start = new Date(body.infoStartTime).getTime()
    const end = new Date(body.infoDeadline).getTime()
    if (!Number.isNaN(start) && !Number.isNaN(end) && start >= end) {
      return errorResponse('行动开始时间必须早于截止时间', 400)
    }
  }

  const activity = await storage.createActivity(buildInfoPayload(body))
  return jsonResponse(activity, 201)
}

export async function handleAdminImport(request: Request, env: EnvConfig): Promise<Response> {
  if (!checkAdminAuth(request, env)) return errorResponse('Unauthorized', 401)

  const body = await parseBody<{ rows?: ParsedImportRow[] }>(request)
  const rows = body.rows ?? []
  if (rows.length === 0) {
    return errorResponse('No rows to import', 400)
  }

  const storage = createStorageAdapter(env)
  let imported = 0
  let registrationsCreated = 0
  let skipped = 0
  const failed: Array<{ title: string; error: string }> = []

  for (const row of rows) {
    if (row.skipReason) {
      skipped++
      continue
    }
    try {
      const activity = await storage.createActivity({
        title: row.title,
        description: row.description ?? '',
        date: row.date,
        location: row.location ?? '',
        meetingLocation: row.meetingLocation,
        meetingTime: row.meetingTime,
        maxParticipants: null,
        fee: '',
        notes: '',
        organizerName: row.organizerName ?? '导入',
        organizerWechat: '',
        organizerContactType: 'private',
        sourceUrl: row.sourceUrl ?? '',
        status: row.status,
        category: row.category,
        interestedCount: 0,
        postType: 'activity',
        recap: row.recap,
      })

      for (const member of row.members) {
        await storage.createRegistration({
          activityId: activity.id,
          name: member,
          wechat: '—',
          contactType: 'other',
          contactValue: '',
          contactLabel: 'Excel导入',
          participantCount: 1,
          note: '',
          registeredAt: row.date ?? new Date().toISOString(),
        })
        registrationsCreated++
      }
      imported++
    } catch (err) {
      failed.push({
        title: row.title,
        error: err instanceof Error ? err.message : 'Import failed',
      })
    }
  }

  return jsonResponse({ imported, registrationsCreated, skipped, failed })
}
