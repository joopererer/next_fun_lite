import type { Activity, ActivityCategory, ActivityStatus } from './types'
import { EXCEL_EPOCH_MS } from './excelSerial'

const CATEGORY_EXPORT_LABELS: Record<ActivityCategory, string> = {
  board_game: '🎲 桌游',
  sports: '🏃 运动',
  culture: '🎨 文化',
  dining: '🍜 聚餐',
  escape_room: '🔐 密室',
  other: '✨ 其他',
}

/** Column order matches the Next Fun project management spreadsheet. */
export const EXPORT_HEADERS = [
  '状态',
  'ID',
  'Date',
  '类型',
  '活动名称',
  '活动地点',
  '集合时间',
  '集合地点',
  '链接',
  '活动介绍',
  '发起人',
  '报名成员（网名后请加上法语分号;）',
  '参加人数',
  '任何想法',
  'After Action Review 复盘',
] as const

export const EXPORT_DATE_COL = 2
export const EXPORT_MEETING_TIME_COL = 6

export interface ExportRowInput {
  activity: Activity
  memberNames: string[]
  headcount?: number
}

export function exportStatusLabel(status: ActivityStatus): string {
  switch (status) {
    case 'ended_success':
      return 'Past'
    case 'ended_cancelled':
      return '已取消'
    case 'recruiting':
      return 'Going'
    case 'proposed':
      return '提议'
    default:
      return 'Going'
  }
}

export function exportCategoryLabel(category: ActivityCategory): string {
  return CATEGORY_EXPORT_LABELS[category] ?? CATEGORY_EXPORT_LABELS.other
}

/** Integer Excel serial for the calendar date (time goes in 集合时间). */
export function exportDateSerial(iso: string | null | undefined): number | '' {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const utcMidnight = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())
  return Math.round((utcMidnight - EXCEL_EPOCH_MS) / 86400000)
}

/** Excel time fraction 0–1 for 集合时间 column (e.g. 0.8333 = 20:00). */
export function exportMeetingTimeFraction(
  meetingTime: string | undefined,
  dateIso: string | null | undefined,
): number | '' {
  let hours: number | null = null
  let minutes: number | null = null

  if (meetingTime?.trim()) {
    const m = meetingTime.trim().match(/(\d{1,2}):(\d{2})/)
    if (m) {
      hours = Number(m[1])
      minutes = Number(m[2])
    }
  } else if (dateIso) {
    const d = new Date(dateIso)
    if (!Number.isNaN(d.getTime()) && (d.getHours() !== 0 || d.getMinutes() !== 0)) {
      hours = d.getHours()
      minutes = d.getMinutes()
    }
  }

  if (hours == null || minutes == null) return ''
  return (hours * 60 + minutes) / (24 * 60)
}

export function formatMemberNames(names: string[]): string {
  return names
    .map((n) => n.trim())
    .filter((n) => n.length > 0 && n !== '—' && n !== '-')
    .join(';')
}

export function activityToExportRow(
  activity: Activity,
  memberNames: string[],
  headcount?: number,
): unknown[] {
  const members = formatMemberNames(memberNames)
  const count =
    headcount ??
    (members ? memberNames.filter((n) => n.trim() && n !== '—').length : 0)

  return [
    exportStatusLabel(activity.status),
    activity.id,
    exportDateSerial(activity.date),
    exportCategoryLabel(activity.category),
    activity.title,
    activity.location ?? '',
    exportMeetingTimeFraction(activity.meetingTime, activity.date),
    activity.meetingLocation ?? '',
    activity.sourceUrl ?? '',
    activity.description ?? '',
    activity.organizerName ?? '',
    members,
    count > 0 ? count : '',
    '',
    activity.recap ?? '',
  ]
}

export function buildExportMatrix(rows: ExportRowInput[]): unknown[][] {
  return [
    [...EXPORT_HEADERS],
    ...rows.map(({ activity, memberNames, headcount }) =>
      activityToExportRow(activity, memberNames, headcount),
    ),
  ]
}

/** Apply Excel number formats so Date / 集合时间 display like the original template. */
export function applyExportSheetFormats(
  ws: Record<string, { v?: unknown; t?: string; z?: string }>,
  rowCount: number,
  encodeCell: (addr: { r: number; c: number }) => string,
): void {
  for (let r = 1; r <= rowCount; r++) {
    const dateRef = encodeCell({ r, c: EXPORT_DATE_COL })
    const dateCell = ws[dateRef]
    if (dateCell && typeof dateCell.v === 'number') {
      dateCell.t = 'n'
      dateCell.z = 'dd/mm/yyyy'
    }

    const timeRef = encodeCell({ r, c: EXPORT_MEETING_TIME_COL })
    const timeCell = ws[timeRef]
    if (timeCell && typeof timeCell.v === 'number') {
      timeCell.t = 'n'
      timeCell.z = 'hh:mm'
    }
  }
}

export function buildExportFilename(prefix = 'NEXT FUN 活动导出'): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${prefix} ${y}-${m}-${day}.xlsx`
}
