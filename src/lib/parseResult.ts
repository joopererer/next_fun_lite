import type { ActivityCategory, FeeLevel, ParseResult } from '../../shared/types'

export function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export interface ParseFormSetters {
  setTitle?: (v: string) => void
  setDescription?: (v: string) => void
  setLocation?: (v: string) => void
  setSourceUrl?: (v: string) => void
  setFee?: (v: string) => void
  setNotes?: (v: string) => void
  setMaxParticipants?: (v: string) => void
  setDate?: (v: string) => void
  setDateEnd?: (v: string) => void
  setDateHint?: (v: string) => void
  setCategory?: (v: ActivityCategory) => void
  setFeeLevel?: (v: FeeLevel) => void
  setItinerary?: (v: string) => void
}

export function applyParseResult(
  data: Partial<ParseResult>,
  setters: ParseFormSetters,
  options?: { getNotes?: () => string; dateHintOnly?: boolean },
): void {
  if (data.title) setters.setTitle?.(data.title)
  if (data.description) setters.setDescription?.(data.description ?? '')
  if (data.location) setters.setLocation?.(data.location ?? '')
  if (data.sourceUrl) setters.setSourceUrl?.(data.sourceUrl)
  if (data.fee) setters.setFee?.(data.fee)
  if (data.maxParticipants != null) setters.setMaxParticipants?.(String(data.maxParticipants))
  if (data.category) setters.setCategory?.(data.category)
  if (data.feeLevel) setters.setFeeLevel?.(data.feeLevel)
  if (data.itinerary) setters.setItinerary?.(data.itinerary)

  if (data.date && !options?.dateHintOnly) {
    setters.setDate?.(toDatetimeLocalValue(data.date))
    if (data.dateEnd) setters.setDateEnd?.(toDatetimeLocalValue(data.dateEnd))
  }

  if (data.date && options?.dateHintOnly) {
    const end = data.dateEnd ?? null
    const start = new Date(data.date)
    const endDate = end ? new Date(end) : null
    let hint = ''
    if (!Number.isNaN(start.getTime())) {
      if (endDate && !Number.isNaN(endDate.getTime())) {
        const sy = start.getFullYear()
        const sm = start.getMonth() + 1
        const sd = start.getDate()
        const em = endDate.getMonth() + 1
        const ed = endDate.getDate()
        hint =
          sy === endDate.getFullYear() && sm === em
            ? `${sy}年${sm}月${sd}日-${ed}日`
            : `${sy}年${sm}月${sd}日-${em}月${ed}日`
      } else {
        hint = `${start.getFullYear()}年${start.getMonth() + 1}月${start.getDate()}日`
      }
    }
    if (hint) setters.setDateHint?.(hint)
    if (end && !Number.isNaN(endDate!.getTime())) {
      setters.setDateEnd?.(toDatetimeLocalValue(end))
    }
  }

  if (data.dateEnd && options?.dateHintOnly && !data.date) {
    setters.setDateEnd?.(toDatetimeLocalValue(data.dateEnd))
  }

  if (options?.dateHintOnly && data.notes?.includes('活动时间：')) {
    const line = data.notes.split('\n').find((l) => l.startsWith('活动时间：'))
    if (line) setters.setDateHint?.(line.replace(/^活动时间：/, '').trim())
  }

  const noteParts: string[] = []
  if (data.notes?.trim()) noteParts.push(data.notes.trim())
  const existing = options?.getNotes?.()?.trim()
  if (existing && !noteParts.includes(existing)) noteParts.unshift(existing)

  if (noteParts.length > 0) {
    setters.setNotes?.(noteParts.join('\n\n'))
  }
}
