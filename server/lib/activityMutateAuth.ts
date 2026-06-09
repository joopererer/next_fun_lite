import type { Activity } from '../../shared/types'
import { isTerminalStatus } from '../../shared/activityStatus'
import { isInfoPost } from '../../shared/infoVisibility'

export function isActivityOrganizer(activity: Activity, userId: string): boolean {
  return Boolean(activity.organizerId && activity.organizerId === userId)
}

export function canOrganizerMutate(activity: Activity): boolean {
  if (isTerminalStatus(activity.status)) return false
  if (isInfoPost(activity)) return true
  if (activity.status === 'recruiting') return true
  if (activity.status === 'proposed') return true
  return false
}

const ORGANIZER_FORBIDDEN: (keyof Activity)[] = [
  'id',
  'createdAt',
  'status',
  'postType',
  'organizerId',
  'interestedCount',
  'linkedRecruitIds',
  'sourceProposalId',
  'endedAt',
  'cancelReason',
  'cancelNote',
  'recap',
  'recapImages',
]

const INFO_ORGANIZER_KEYS: (keyof Activity)[] = [
  'title',
  'description',
  'category',
  'location',
  'sourceUrl',
  'organizerName',
  'infoStartTime',
  'infoDeadline',
  'infoPrice',
  'infoActionLabel',
  'infoActionUrl',
]

const PROPOSAL_ORGANIZER_KEYS: (keyof Activity)[] = [
  'title',
  'description',
  'location',
  'sourceUrl',
  'category',
  'fee',
  'feeLevel',
  'notes',
  'itinerary',
  'dateEnd',
  'organizerName',
  'organizerContactType',
  'organizerContact',
  'organizerContactLabel',
  'organizerWechat',
]

const RECRUIT_ORGANIZER_KEYS: (keyof Activity)[] = [
  'title',
  'description',
  'date',
  'dateEnd',
  'registrationDeadline',
  'location',
  'meetingLocation',
  'meetingTime',
  'minParticipants',
  'maxParticipants',
  'fee',
  'notes',
  'organizerName',
  'organizerContactType',
  'organizerContact',
  'organizerContactLabel',
  'organizerWechat',
  'sourceUrl',
  'category',
  'feeLevel',
  'ticketPrices',
  'ticketUrl',
  'ticketDeadline',
  'ticketMethod',
  'refundPolicy',
  'difficulty',
  'distanceAndDuration',
  'itinerary',
  'equipment',
  'transportation',
  'mealArrangement',
  'restaurantAddress',
  'perPersonCost',
  'reservationMethod',
  'requiresDeposit',
]

function allowedKeysFor(activity: Activity): (keyof Activity)[] {
  if (isInfoPost(activity)) return INFO_ORGANIZER_KEYS
  if (activity.status === 'proposed') return PROPOSAL_ORGANIZER_KEYS
  return RECRUIT_ORGANIZER_KEYS
}

export function filterOrganizerUpdate(activity: Activity, body: Partial<Activity>): Partial<Activity> {
  const allowed = new Set<keyof Activity>(allowedKeysFor(activity))
  const out: Partial<Activity> = {}
  for (const [key, value] of Object.entries(body) as [keyof Activity, unknown][]) {
    if (ORGANIZER_FORBIDDEN.includes(key)) continue
    if (!allowed.has(key)) continue
    if (value !== undefined) {
      (out as Record<string, unknown>)[key] = value
    }
  }
  if (isInfoPost(activity) && out.infoPrice !== undefined) {
    out.fee = String(out.infoPrice).trim()
  }
  return out
}
