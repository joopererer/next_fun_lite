import type { Activity, ActivityCategory, ActivityStatus } from './types'

export interface ParsedImportRow {
  title: string
  date: string | null
  status: ActivityStatus
  category: ActivityCategory
  location: string
  meetingLocation?: string
  meetingTime?: string
  sourceUrl?: string
  description?: string
  organizerName?: string
  members: string[]
  recap?: string
  warning?: string
  skipReason?: string
}

export interface ImportPreviewResult {
  importable: ParsedImportRow[]
  warnings: ParsedImportRow[]
  skipped: ParsedImportRow[]
}

const COLUMN_ALIASES: Record<string, keyof ParsedImportRow | 'membersRaw' | 'statusRaw' | 'dateRaw' | 'categoryRaw'> = {
  '状态': 'statusRaw',
  'date': 'dateRaw',
  '日期': 'dateRaw',
  '类型': 'categoryRaw',
  '活动名称': 'title',
  '活动地点': 'location',
  '集合时间': 'meetingTime',
  '集合地点': 'meetingLocation',
  '链接': 'sourceUrl',
  '活动介绍': 'description',
  '发起人': 'organizerName',
  '报名成员': 'membersRaw',
  '参加成员': 'membersRaw',
  '报名名单': 'membersRaw',
  '成员名单': 'membersRaw',
  'after action review 复盘': 'recap',
  '复盘': 'recap',
}

export function mapCategory(raw: string): ActivityCategory {
  const s = raw.toLowerCase()
  if (s.includes('文化') || s.includes('🎨')) return 'culture'
  if (s.includes('运动') || s.includes('👟')) return 'sports'
  if (s.includes('聚餐') || s.includes('🍷') || s.includes('🍜')) return 'dining'
  if (s.includes('桌游') || s.includes('🎲')) return 'board_game'
  if (s.includes('密室') || s.includes('❓')) return 'escape_room'
  return 'other'
}

export function parseMembers(raw: string): string[] {
  const s = String(raw ?? '').trim()
  if (!s) return []

  // A lone number is a headcount column (参加人数), not a name list.
  if (/^\d+$/.test(s)) return []

  const parts = s
    .split(/[;；,，、\n]+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0 && part !== '👀')
    .map((part) => part.replace(/\(.*?\)/g, '').replace(/（.*?）/g, '').trim())
    .filter(
      (part) =>
        part.length > 0 &&
        !/^[\p{Emoji_Presentation}\p{Extended_Pictographic}]+$/u.test(part),
    )

  return parts
}

const MEMBER_COLUMN_NAMES = ['报名成员', '参加成员', '报名名单', '成员名单', 'members']

function looksLikeMemberList(raw: string): boolean {
  const s = raw.trim()
  if (!s || /^\d+$/.test(s)) return false
  if (/[;；]/.test(s)) return /[\p{L}\p{Script=Han}]/u.test(s)
  return s.length > 0 && s.length <= 40 && /[\p{L}\p{Script=Han}]/u.test(s)
}

/** Resolve the members cell: named column first, then scan for semicolon-separated names. */
export function resolveMembersCellRaw(row: unknown[], headers: string[]): string {
  for (const name of MEMBER_COLUMN_NAMES) {
    const idx = colIndex(headers, name)
    if (idx < 0) continue
    const raw = String(row[idx] ?? '').trim()
    if (raw && !/^\d+$/.test(raw)) return raw
  }

  for (let i = 0; i < row.length; i++) {
    const raw = String(row[i] ?? '').trim()
    if (!looksLikeMemberList(raw)) continue
    const parsed = parseMembers(raw)
    if (parsed.length >= 1 && /[;；]/.test(raw)) return raw
  }

  return ''
}

/** Excel serial date epoch (1899-12-30 UTC). */
const EXCEL_EPOCH_MS = Date.UTC(1899, 11, 30)

export function excelSerialToDate(serial: number): Date {
  const wholeDays = Math.floor(serial)
  const fraction = serial - wholeDays
  const ms = EXCEL_EPOCH_MS + wholeDays * 86400000 + Math.round(fraction * 86400000)
  return new Date(ms)
}

export function excelSerialToTimeParts(serial: number): { hours: number; minutes: number } | null {
  if (!Number.isFinite(serial) || serial < 0 || serial >= 1) return null
  const totalMinutes = Math.round(serial * 24 * 60)
  const hours = Math.floor(totalMinutes / 60) % 24
  const minutes = totalMinutes % 60
  return { hours, minutes }
}

function isExcelSerialNumber(n: number): boolean {
  return Number.isFinite(n) && n >= 1 && n < 1_000_000
}

function isExcelSerialString(s: string): boolean {
  return /^\d+(\.\d+)?$/.test(s) && isExcelSerialNumber(Number(s))
}

function parseTimeParts(raw: unknown): { hours: number; minutes: number } | null {
  if (raw === null || raw === undefined || raw === '') return null
  if (typeof raw === 'number') {
    if (raw >= 0 && raw < 1) return excelSerialToTimeParts(raw)
    if (isExcelSerialNumber(raw) && raw % 1 !== 0) {
      const d = excelSerialToDate(raw)
      return { hours: d.getHours(), minutes: d.getMinutes() }
    }
    return null
  }
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) {
    return { hours: raw.getHours(), minutes: raw.getMinutes() }
  }
  const s = String(raw).trim()
  if (!s) return null
  const m = s.match(/(\d{1,2}):(\d{2})/)
  if (m) return { hours: Number(m[1]), minutes: Number(m[2]) }
  return null
}

export function formatMeetingTimeDisplay(raw: unknown): string | undefined {
  if (raw === null || raw === undefined || raw === '') return undefined
  if (typeof raw === 'number' && raw >= 0 && raw < 1) {
    const parts = excelSerialToTimeParts(raw)
    if (parts) {
      return `${String(parts.hours).padStart(2, '0')}:${String(parts.minutes).padStart(2, '0')}`
    }
  }
  const s = String(raw).trim()
  return s || undefined
}

/** Parse DD/MM or DD/MM/YYYY text (European day-first). */
export function parseExcelDateString(raw: string, defaultYear = new Date().getFullYear()): Date | null {
  const s = String(raw ?? '').trim()
  if (!s) return null

  if (isExcelSerialString(s)) {
    return excelSerialToDate(Number(s))
  }

  const m = s.match(/^(\d{1,2})[/.-](\d{1,2})(?:[/.-](\d{2,4}))?(?:\s+(\d{1,2}):(\d{2}))?$/)
  if (m) {
    const day = Number(m[1])
    const month = Number(m[2]) - 1
    let year = m[3] ? Number(m[3]) : defaultYear
    if (year < 100) year += 2000
    const hours = m[4] ? Number(m[4]) : 12
    const minutes = m[5] ? Number(m[5]) : 0
    const d = new Date(year, month, day, hours, minutes, 0, 0)
    if (Number.isNaN(d.getTime())) return null
    return d
  }

  if (!/^\d+(\.\d+)?$/.test(s)) {
    const iso = Date.parse(s)
    if (!Number.isNaN(iso)) return new Date(iso)
  }

  return null
}

export function parseExcelDate(raw: string, defaultYear = new Date().getFullYear()): string | null {
  const d = parseExcelDateString(raw, defaultYear)
  return d ? d.toISOString() : null
}

export function parseExcelDateCell(raw: unknown, defaultYear = new Date().getFullYear()): Date | null {
  if (raw === null || raw === undefined || raw === '') return null
  if (raw instanceof Date) return Number.isNaN(raw.getTime()) ? null : raw
  if (typeof raw === 'number') {
    if (raw >= 0 && raw < 1) return null
    if (isExcelSerialNumber(raw)) return excelSerialToDate(raw)
    return null
  }
  return parseExcelDateString(String(raw), defaultYear)
}

export function resolveImportDateTime(
  dateRaw: unknown,
  meetingTimeRaw: unknown,
  defaultYear = new Date().getFullYear(),
): { date: string | null; meetingTime?: string; warning?: string } {
  let baseDate = parseExcelDateCell(dateRaw, defaultYear)
  const meetingTime = formatMeetingTimeDisplay(meetingTimeRaw)
  const timeParts = parseTimeParts(meetingTimeRaw)

  if (baseDate && timeParts && meetingTimeRaw !== undefined && meetingTimeRaw !== '') {
    const merged = new Date(baseDate)
    merged.setHours(timeParts.hours, timeParts.minutes, 0, 0)
    baseDate = merged
  }

  const dateRawLabel = dateRaw === null || dateRaw === undefined ? '' : String(dateRaw).trim()
  const warning = dateRawLabel && !baseDate ? `日期格式异常：${dateRawLabel}` : undefined

  return {
    date: baseDate ? baseDate.toISOString() : null,
    meetingTime,
    warning,
  }
}

function mapStatus(raw: string): ActivityStatus {
  const s = raw.trim().toLowerCase()
  if (s === 'past' || s.includes('结束') || s.includes('past')) return 'ended_success'
  if (s === 'going' || s.includes('招募') || s.includes('going')) return 'recruiting'
  return 'recruiting'
}

function normalizeHeader(cell: unknown): string {
  return String(cell ?? '').trim().toLowerCase()
}

export function findActivitySheetRows(matrix: unknown[][]): { headerIndex: number; headers: string[] } | null {
  for (let i = 0; i < matrix.length; i++) {
    const row = matrix[i]
    if (!row) continue
    if (row.some((cell) => String(cell ?? '').includes('活动名称'))) {
      return {
        headerIndex: i,
        headers: row.map((c) => String(c ?? '').trim()),
      }
    }
  }
  return null
}

function colIndex(headers: string[], ...names: string[]): number {
  const normalized = headers.map(normalizeHeader)
  for (const name of names) {
    const n = name.toLowerCase()
    const idx = normalized.findIndex((h) => h === n)
    if (idx >= 0) return idx
  }
  for (const name of names) {
    const n = name.toLowerCase()
    const idx = normalized.findIndex((h) => h.includes(n))
    if (idx >= 0) return idx
  }
  return -1
}

export function mapRowToImport(
  row: unknown[],
  headers: string[],
  defaultYear?: number,
): ParsedImportRow | null {
  const get = (...names: string[]) => {
    const idx = colIndex(headers, ...names)
    if (idx < 0) return ''
    return String(row[idx] ?? '').trim()
  }

  const getCell = (...names: string[]) => {
    const idx = colIndex(headers, ...names)
    if (idx < 0) return undefined
    return row[idx]
  }

  const title = get('活动名称')
  if (!title) return null

  const year = defaultYear ?? new Date().getFullYear()
  const { date, meetingTime, warning } = resolveImportDateTime(
    getCell('date', '日期'),
    getCell('集合时间'),
    year,
  )

  const members = parseMembers(resolveMembersCellRaw(row, headers))

  return {
    title,
    date,
    status: mapStatus(get('状态')),
    category: mapCategory(get('类型')),
    location: get('活动地点'),
    meetingLocation: get('集合地点') || undefined,
    meetingTime,
    sourceUrl: get('链接') || undefined,
    description: get('活动介绍') || undefined,
    organizerName: get('发起人') || undefined,
    members,
    recap: get('after action review 复盘', '复盘') || undefined,
    warning,
  }
}

export function buildImportPreview(
  matrix: unknown[][],
  existing: Activity[],
  defaultYear?: number,
): ImportPreviewResult {
  const sheet = findActivitySheetRows(matrix)
  if (!sheet) {
    return { importable: [], warnings: [], skipped: [{ title: '(无效表格)', date: null, status: 'recruiting', category: 'other', location: '', members: [], skipReason: '未找到有效的活动数据表' }] }
  }

  const { headerIndex, headers } = sheet
  const importable: ParsedImportRow[] = []
  const warnings: ParsedImportRow[] = []
  const skipped: ParsedImportRow[] = []

  const existingKeys = new Set(
    existing
      .filter((a) => a.date && a.title)
      .map((a) => `${a.title.trim()}|${new Date(a.date!).toISOString().slice(0, 10)}`),
  )

  for (let i = headerIndex + 1; i < matrix.length; i++) {
    const row = matrix[i]
    if (!row || row.every((c) => !String(c ?? '').trim())) continue

    const parsed = mapRowToImport(row, headers, defaultYear)
    if (!parsed) continue

    const key = parsed.date
      ? `${parsed.title.trim()}|${new Date(parsed.date).toISOString().slice(0, 10)}`
      : null

    if (key && existingKeys.has(key)) {
      skipped.push({ ...parsed, skipReason: '已存在相同标题+日期' })
      continue
    }

    if (parsed.warning) {
      warnings.push(parsed)
    } else {
      importable.push(parsed)
    }

    if (key) existingKeys.add(key)
  }

  return { importable, warnings, skipped }
}
