import type { Activity, ActivityCategory, ActivityStatus } from './types'

/** Same epoch as excelImport — Excel serial date (1899-12-30 UTC). */
const EXCEL_EPOCH_MS = Date.UTC(1899, 11, 30)

const CATEGORY_EXPORT_LABELS: Record<ActivityCategory, string> = {
  board_game: '🎲 桌游',
  sports: '🏃 运动',
  culture: '🎨 文化',
  dining: '🍜 聚餐',
  escape_room: '🔐 密室',
  other: '✨ 其他',
}

export const EXPORT_HEADERS = [
  '状态',
  '日期',
  '类型',
  '活动名称',
  '活动地点',
  '集合时间',
  '集合地点',
  '链接',
  '活动介绍',
  '发起人',
  '参加人数',
  '报名成员',
  '复盘',
] as const

export interface ExportRowInput {
  activity: Activity
  memberNames: string[]
  headcount?: number
}

export function dateToExcelSerial(d: Date): number {
  const ms = d.getTime() - EXCEL_EPOCH_MS
  return ms / 86400000
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

export function exportDateSerial(iso: string | null | undefined): number | '' {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const local = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0, 0)
  return dateToExcelSerial(local)
}

export function exportMeetingTime(
  meetingTime: string | undefined,
  dateIso: string | null | undefined,
): string {
  if (meetingTime?.trim()) return meetingTime.trim()
  if (!dateIso) return ''
  const d = new Date(dateIso)
  if (Number.isNaN(d.getTime())) return ''
  if (d.getHours() === 0 && d.getMinutes() === 0) return ''
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
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
    exportDateSerial(activity.date),
    exportCategoryLabel(activity.category),
    activity.title,
    activity.location ?? '',
    exportMeetingTime(activity.meetingTime, activity.date),
    activity.meetingLocation ?? '',
    activity.sourceUrl ?? '',
    activity.description ?? '',
    activity.organizerName ?? '',
    count > 0 ? count : '',
    members,
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

export function buildExportFilename(prefix = 'NEXT FUN 活动导出'): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${prefix} ${y}-${m}-${day}.xlsx`
}
