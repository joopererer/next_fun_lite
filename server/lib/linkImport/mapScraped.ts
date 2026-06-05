import type { ActivityCategory, FeeLevel } from '../../../shared/types'
import type { ScrapedActivity } from './types'

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

export function mapScrapedCategory(category: ScrapedActivity['category']): ActivityCategory {
  switch (category) {
    case 'MOVIE':
    case 'EXHIBITION':
    case 'THEATER':
    case 'MUSIC':
      return 'culture'
    case 'FOOD':
      return 'dining'
    case 'SPORTS':
    case 'TRAVEL':
      return 'sports'
    case 'BOARD_GAME':
      return 'board_game'
    default:
      return 'other'
  }
}

export function formatScrapedFee(activity: ScrapedActivity): string {
  const text = activity.priceText?.trim() ?? ''
  if (
    activity.priceType === 'FREE' ||
    /^免费$/i.test(text) ||
    /gratuit|^free$/i.test(text)
  ) {
    return '免费'
  }
  if (text === '查看原文' || !text) {
    return ''
  }
  if (activity.priceType === 'RANGE' && /\d/.test(text)) {
    return `预算区间 · ${text}`
  }
  return text
}

export function inferFeeLevel(activity: ScrapedActivity, fee: string): FeeLevel {
  if (
    activity.priceType === 'FREE' ||
    fee === '免费' ||
    /免费|gratuit|^free$/i.test(fee)
  ) {
    return 'free'
  }
  if (activity.priceType === 'RANGE' || activity.priceType === 'FIXED') {
    return 'paid'
  }
  if (/低消|<\s*20/i.test(fee)) return 'low'
  return fee ? 'unknown' : 'unknown'
}

function formatZhDate(d: Date, withTime: boolean): string {
  const yearPrefix =
    d.getFullYear() !== new Date().getFullYear() ? `${d.getFullYear()}年` : ''
  const month = d.getMonth() + 1
  const day = d.getDate()
  if (!withTime) return `${yearPrefix}${month}月${day}日`
  const time = d.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  return `${yearPrefix}${month}月${day}日 ${WEEKDAYS[d.getDay()]} ${time}`
}

export function formatScrapedDateRange(startIso: string, endIso: string | null): string {
  const start = new Date(startIso)
  if (Number.isNaN(start.getTime())) return ''
  if (!endIso) return formatZhDate(start, true)

  const end = new Date(endIso)
  if (Number.isNaN(end.getTime())) return formatZhDate(start, true)

  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate()

  if (sameDay) {
    const datePart = formatZhDate(start, true).replace(/ \d{2}:\d{2}$/, '')
    const startTime = start.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
    const endTime = end.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
    return `${datePart} ${startTime} - ${endTime}`
  }

  const startYear = start.getFullYear()
  const endYear = end.getFullYear()
  const startMonth = start.getMonth() + 1
  const endMonth = end.getMonth() + 1
  const startDay = start.getDate()
  const endDay = end.getDate()

  if (startYear === endYear && startMonth === endMonth) {
    return `${startYear}年${startMonth}月${startDay}日-${endDay}日`
  }
  if (startYear === endYear) {
    return `${startYear}年${startMonth}月${startDay}日-${endMonth}月${endDay}日`
  }
  return `${startYear}年${startMonth}月${startDay}日-${endYear}年${endMonth}月${endDay}日`
}

export function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
