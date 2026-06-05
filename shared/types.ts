export type ActivityStatus = 'proposed' | 'recruiting' | 'ended'

export type ActivityCategory =
  | 'board_game'
  | 'sports'
  | 'culture'
  | 'dining'
  | 'escape_room'
  | 'other'

export interface Activity {
  id: string
  title: string
  description: string
  date: string | null
  location: string
  maxParticipants: number | null
  fee: string
  notes: string
  organizerName: string
  organizerWechat: string
  sourceUrl: string
  status: ActivityStatus
  category: ActivityCategory
  interestedCount: number
  createdAt: string
}

export interface Registration {
  id: string
  activityId: string
  name: string
  wechat: string
  participantCount: number
  note: string
  registeredAt: string
}

export interface Interest {
  id: string
  activityId: string
  name: string
  wechat: string
  createdAt: string
}

export interface ActivityWithCount extends Activity {
  registeredCount: number
}

export interface InterestMutationResult {
  interest?: Interest
  interestedCount: number
}

export interface ParseResult {
  title?: string | null
  description?: string | null
  date?: string | null
  location?: string | null
  maxParticipants?: number | null
  fee?: string | null
  notes?: string | null
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
  TENCENT_DOCS_APP_ID?: string
  TENCENT_DOCS_APP_SECRET?: string
  CLAUDE_API_KEY?: string
  ADMIN_PASSWORD?: string
  SITE_URL?: string
  PARSE_MODE?: string
}
