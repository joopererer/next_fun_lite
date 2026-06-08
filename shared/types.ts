export type ActivityStatus =
  | 'proposed'
  | 'recruiting'
  | 'ended_success'
  | 'ended_cancelled'

export type CancelReason = 'weather' | 'insufficient_participants' | 'venue' | 'other'

export type ActivityCategory =
  | 'board_game'
  | 'sports'
  | 'culture'
  | 'dining'
  | 'escape_room'
  | 'other'

export type FeeLevel = 'free' | 'low' | 'paid' | 'unknown'
export type TicketMethod = 'self' | 'group'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type MealArrangement = 'self' | 'restaurant' | 'group'
export type ReservationMethod = 'organizer' | 'self'
export type OrganizerContactType = 'wechat' | 'email' | 'other' | 'private'
export type RegistrantContactType = 'wechat' | 'email' | 'other'
export type PostType = 'activity' | 'info'

export interface Activity {
  id: string
  title: string
  description: string
  date: string | null
  dateEnd?: string | null
  registrationDeadline?: string | null
  location: string
  minParticipants?: number | null
  maxParticipants: number | null
  fee: string
  notes: string
  organizerName: string
  organizerWechat: string
  organizerContactType?: OrganizerContactType
  organizerContact?: string
  organizerContactLabel?: string
  organizerId?: string
  meetingLocation?: string
  meetingTime?: string
  postType?: PostType
  infoDeadline?: string
  infoPrice?: string
  infoActionLabel?: string
  infoActionUrl?: string
  sourceUrl: string
  status: ActivityStatus
  category: ActivityCategory
  interestedCount: number
  createdAt: string
  feeLevel?: FeeLevel
  ticketPrices?: string
  ticketUrl?: string
  ticketDeadline?: string
  ticketMethod?: TicketMethod
  refundPolicy?: string
  difficulty?: Difficulty
  distanceAndDuration?: string
  itinerary?: string
  equipment?: string
  transportation?: string
  mealArrangement?: MealArrangement
  restaurantAddress?: string
  perPersonCost?: string
  reservationMethod?: ReservationMethod
  requiresDeposit?: boolean
  recap?: string
  recapImages?: string
  sourceProposalId?: string
  linkedRecruitIds?: string[]
  endedAt?: string
  cancelReason?: CancelReason
  cancelNote?: string
}

export interface Registration {
  id: string
  activityId: string
  userId?: string
  name: string
  wechat: string
  contactType?: RegistrantContactType
  contactValue?: string
  contactLabel?: string
  participantCount: number
  note: string
  registeredAt: string
  cancelToken?: string
  cancelledAt?: string
  cancelledBy?: 'user' | 'admin'
}

export interface Interest {
  id: string
  activityId: string
  userId?: string
  deviceId?: string
  name?: string
  wechat?: string
  createdAt: string
}

export interface Profile {
  id: string
  nickname: string
  wechat?: string
  email?: string
  createdAt: string
  updatedAt: string
}

export interface ActivityWithCount extends Activity {
  registeredCount: number
}

export interface RegistrationMutationResult {
  registration?: Registration
  registeredCount: number
  cancelToken?: string
  success?: boolean
}

export interface InterestMutationResult {
  interest?: Interest
  interestedCount: number
}

export interface RecruitmentResponse {
  activity: Activity
  eventUrl: string
}

export interface ParseResult {
  title?: string | null
  description?: string | null
  date?: string | null
  dateEnd?: string | null
  location?: string | null
  maxParticipants?: number | null
  fee?: string | null
  notes?: string | null
  category?: ActivityCategory | null
  feeLevel?: FeeLevel | null
  itinerary?: string | null
}

export interface ApiParseResponse {
  success: boolean
  data: Partial<ParseResult>
  message?: string
}

export type EnvConfig = {
  STORAGE_BACKEND?: string
  GOOGLE_SHEETS_ID?: string
  GOOGLE_SERVICE_ACCOUNT_JSON?: string
  SUPABASE_URL?: string
  SUPABASE_SERVICE_KEY?: string
  SUPABASE_SERVICE_ROLE_KEY?: string
  NEXT_PUBLIC_SUPABASE_URL?: string
  TENCENT_DOCS_APP_ID?: string
  TENCENT_DOCS_APP_SECRET?: string
  CLAUDE_API_KEY?: string
  OPENAI_API_KEY?: string
  GEMINI_API_KEY?: string
  GEMINI_MODEL?: string
  ADMIN_PASSWORD?: string
  SITE_URL?: string
  PARSE_MODE?: string
  CLERK_SECRET_KEY?: string
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?: string
}

export type CreateRecruitmentBody = Partial<Activity> & {
  sourceProposalId?: string
}
