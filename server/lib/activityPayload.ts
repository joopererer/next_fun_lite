import type { Activity, CreateRecruitmentBody } from '../../shared/types'
import {
  syncOrganizerWechatFromContact,
  type OrganizerContactType,
} from '../../shared/contact'

const DEFAULT_MIN = 1
const DEFAULT_MAX = 99

const PARTICIPANT_MIN = 0
const PARTICIPANT_MAX = 99

function normalizeMinParticipants(body: Partial<Activity>): number {
  const val = body.minParticipants
  if (val === undefined || val === null) return DEFAULT_MIN
  if (typeof val === 'number' && val >= PARTICIPANT_MIN && val <= PARTICIPANT_MAX) return val
  return DEFAULT_MIN
}

function normalizeMaxParticipants(body: Partial<Activity>): number | null {
  if (body.maxParticipants === null) return null
  const val = body.maxParticipants
  if (val === undefined) return DEFAULT_MAX
  if (typeof val === 'number' && val === 0) return null
  if (typeof val === 'number' && val >= 1 && val <= PARTICIPANT_MAX) return val
  return DEFAULT_MAX
}

const EXTENDED_KEYS: (keyof Activity)[] = [
  'dateEnd', 'registrationDeadline',
  'organizerContactType', 'organizerContact', 'organizerContactLabel',
  'meetingLocation', 'meetingTime',
  'postType', 'infoStartTime', 'infoDeadline', 'infoPrice', 'infoActionLabel', 'infoActionUrl',
  'feeLevel', 'ticketPrices', 'ticketUrl', 'ticketDeadline', 'ticketMethod', 'refundPolicy',
  'difficulty', 'distanceAndDuration', 'itinerary', 'equipment', 'transportation', 'mealArrangement',
  'restaurantAddress', 'perPersonCost', 'reservationMethod', 'requiresDeposit', 'recap', 'recapImages',
  'sourceProposalId', 'linkedRecruitIds', 'endedAt', 'cancelReason', 'cancelNote',
]

function normalizeOrganizerContact(body: Partial<Activity>): {
  organizerContactType: OrganizerContactType
  organizerContact: string
  organizerContactLabel?: string
  organizerWechat: string
} {
  const type = body.organizerContactType
    ?? (body.organizerWechat?.trim() ? 'wechat' : 'private')
  const contact = type === 'private'
    ? ''
    : (body.organizerContact?.trim() ?? body.organizerWechat?.trim() ?? '')
  const label = body.organizerContactLabel?.trim() || undefined
  return {
    organizerContactType: type,
    organizerContact: contact,
    organizerContactLabel: label,
    organizerWechat: syncOrganizerWechatFromContact(type, contact),
  }
}

export function pickExtendedFields(body: Partial<Activity>): Partial<Activity> {
  const out: Partial<Activity> = {}
  for (const key of EXTENDED_KEYS) {
    const val = body[key]
    if (val !== undefined && val !== '') {
      (out as Record<string, unknown>)[key] = val
    }
  }
  return out
}

export function buildRecruitmentPayload(body: CreateRecruitmentBody): Partial<Activity> {
  const minParticipants = normalizeMinParticipants(body)
  const maxParticipants = normalizeMaxParticipants(body)
  if (maxParticipants != null && minParticipants > maxParticipants) {
    throw new Error('最少人数不能大于最多人数')
  }

  const contact = normalizeOrganizerContact(body)

  return {
    title: body.title?.trim() ?? '',
    description: body.description?.trim() ?? '',
    date: body.date ?? null,
    dateEnd: body.dateEnd ?? null,
    registrationDeadline: body.registrationDeadline ?? null,
    location: body.location?.trim() ?? '',
    meetingLocation: body.meetingLocation?.trim() || undefined,
    meetingTime: body.meetingTime?.trim() || undefined,
    minParticipants,
    maxParticipants,
    fee: body.fee?.trim() ?? '',
    notes: body.notes?.trim() ?? '',
    organizerName: body.organizerName?.trim() ?? '',
    ...contact,
    sourceUrl: body.sourceUrl?.trim() ?? '',
    category: body.category ?? 'other',
    status: 'recruiting',
    postType: 'activity',
    ...pickExtendedFields(body),
  }
}

export function buildProposalPayload(body: Partial<Activity>): Omit<Activity, 'id' | 'createdAt'> {
  const contact = normalizeOrganizerContact(body)
  return {
    title: body.title ?? '',
    description: body.description ?? '',
    date: body.date ?? null,
    location: body.location ?? '',
    maxParticipants: null,
    fee: body.fee ?? '',
    notes: body.notes ?? '',
    organizerName: body.organizerName ?? '',
    ...contact,
    sourceUrl: body.sourceUrl ?? '',
    status: 'proposed',
    category: body.category ?? 'other',
    interestedCount: 0,
    postType: 'activity',
    feeLevel: body.feeLevel,
    ...pickExtendedFields(body),
  }
}

export function buildInfoPayload(body: Partial<Activity>): Omit<Activity, 'id' | 'createdAt'> {
  return {
    title: body.title?.trim() ?? '',
    description: body.description?.trim() ?? '',
    date: null,
    location: body.location?.trim() ?? '',
    maxParticipants: null,
    fee: body.infoPrice?.trim() ?? '',
    notes: '',
    organizerName: body.organizerName?.trim() ?? '',
    organizerWechat: '',
    organizerContactType: 'private',
    organizerContact: '',
    sourceUrl: body.sourceUrl?.trim() ?? '',
    status: 'proposed',
    category: body.category ?? 'other',
    interestedCount: 0,
    postType: 'info',
    infoStartTime: body.infoStartTime ?? undefined,
    infoDeadline: body.infoDeadline ?? undefined,
    infoPrice: body.infoPrice?.trim() || undefined,
    infoActionLabel: body.infoActionLabel?.trim() || undefined,
    infoActionUrl: body.infoActionUrl?.trim() || undefined,
    ...pickExtendedFields(body),
  }
}

export function buildAdminCreatePayload(body: Partial<Activity>): Omit<Activity, 'id' | 'createdAt'> {
  const minParticipants = normalizeMinParticipants(body)
  const maxParticipants = normalizeMaxParticipants(body)
  const contact = normalizeOrganizerContact(body)

  return {
    title: body.title ?? '',
    description: body.description ?? '',
    date: body.date ?? null,
    location: body.location ?? '',
    meetingLocation: body.meetingLocation?.trim() || undefined,
    meetingTime: body.meetingTime?.trim() || undefined,
    minParticipants,
    maxParticipants,
    fee: body.fee ?? '',
    notes: body.notes ?? '',
    organizerName: body.organizerName ?? '',
    ...contact,
    sourceUrl: body.sourceUrl ?? '',
    status: body.status ?? 'proposed',
    category: body.category ?? 'other',
    interestedCount: body.interestedCount ?? 0,
    postType: body.postType ?? 'activity',
    feeLevel: body.feeLevel,
    ...pickExtendedFields(body),
  }
}
