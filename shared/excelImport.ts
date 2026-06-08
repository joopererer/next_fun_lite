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
  '参加人数': 'membersRaw',
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
  if (!raw?.trim()) return []
  return raw
    .split(/[;；]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s !== '👀')
    .map((s) => s.replace(/\(.*?\)/g, '').replace(/（.*?）/g, '').trim())
    .filter((s) => s.length > 0 && !/^[\p{Emoji_Presentation}\p{Extended_Pictographic}]+$/u.test(s))
}

export function parseExcelDate(raw: string, defaultYear = new Date().getFullYear()): string | null {
  const s = String(raw ?? '').trim()
  if (!s) return null

  const iso = Date.parse(s)
  if (!Number.isNaN(iso)) return new Date(iso).toISOString()

  const m = s.match(/^(\d{1,2})[/.-](\d{1,2})(?:[/.-](\d{2,4}))?$/)
  if (!m) return null

  const day = Number(m[1])
  const month = Number(m[2]) - 1
  let year = m[3] ? Number(m[3]) : defaultYear
  if (year < 100) year += 2000

  const d = new Date(year, month, day, 12, 0, 0, 0)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
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
    const idx = normalized.findIndex((h) => h === name.toLowerCase() || h.includes(name.toLowerCase()))
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

  const title = get('活动名称')
  if (!title) return null

  const dateRaw = get('date', '日期')
  const date = parseExcelDate(dateRaw, defaultYear)
  const warning = dateRaw && !date ? `日期格式异常：${dateRaw}` : undefined

  const members = parseMembers(get('报名成员', '参加人数'))

  return {
    title,
    date,
    status: mapStatus(get('状态')),
    category: mapCategory(get('类型')),
    location: get('活动地点'),
    meetingLocation: get('集合地点') || undefined,
    meetingTime: get('集合时间') || undefined,
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
