import type { Activity, CreateRecruitmentBody } from '../../shared/types'

const EXTENDED_KEYS: (keyof Activity)[] = [
  'feeLevel', 'ticketPrices', 'ticketUrl', 'ticketDeadline', 'ticketMethod', 'refundPolicy',
  'difficulty', 'distanceAndDuration', 'itinerary', 'equipment', 'transportation', 'mealArrangement',
  'restaurantAddress', 'perPersonCost', 'reservationMethod', 'requiresDeposit', 'recap', 'recapImages',
]

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
  return {
    title: body.title?.trim() ?? '',
    description: body.description?.trim() ?? '',
    date: body.date ?? null,
    location: body.location?.trim() ?? '',
    maxParticipants: body.maxParticipants ?? null,
    fee: body.fee?.trim() ?? '',
    notes: body.notes?.trim() ?? '',
    organizerName: body.organizerName?.trim() ?? '',
    organizerWechat: body.organizerWechat?.trim() ?? '',
    sourceUrl: body.sourceUrl?.trim() ?? '',
    category: body.category ?? 'other',
    status: 'recruiting',
    ...pickExtendedFields(body),
  }
}

export function buildProposalPayload(body: Partial<Activity>): Omit<Activity, 'id' | 'createdAt'> {
  return {
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
    feeLevel: body.feeLevel,
    ...pickExtendedFields(body),
  }
}

export function buildAdminCreatePayload(body: Partial<Activity>): Omit<Activity, 'id' | 'createdAt'> {
  return {
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
    feeLevel: body.feeLevel,
    ...pickExtendedFields(body),
  }
}
