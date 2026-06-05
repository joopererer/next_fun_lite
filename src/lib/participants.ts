export const DEFAULT_MIN_PARTICIPANTS = 1
export const DEFAULT_MAX_PARTICIPANTS = 99
export const PARTICIPANT_INPUT_MIN = 0
export const PARTICIPANT_INPUT_MAX = 99

/** 只允许 0–99 的整数；空字符串表示留空用默认值 */
export function clampParticipantInput(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits === '') return ''
  const n = Math.min(PARTICIPANT_INPUT_MAX, Math.max(PARTICIPANT_INPUT_MIN, parseInt(digits, 10)))
  return String(n)
}

export function parseMinParticipants(value: string): number {
  const trimmed = value.trim()
  if (!trimmed) return DEFAULT_MIN_PARTICIPANTS
  const n = parseInt(trimmed, 10)
  if (Number.isNaN(n) || n < PARTICIPANT_INPUT_MIN || n > PARTICIPANT_INPUT_MAX) {
    return DEFAULT_MIN_PARTICIPANTS
  }
  return n
}

/** 0 表示不限人数；留空则用默认 99 */
export function parseMaxParticipants(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return DEFAULT_MAX_PARTICIPANTS
  const n = parseInt(trimmed, 10)
  if (Number.isNaN(n) || n < PARTICIPANT_INPUT_MIN || n > PARTICIPANT_INPUT_MAX) {
    return DEFAULT_MAX_PARTICIPANTS
  }
  if (n === 0) return null
  return n
}

export function isRegistrationFull(registeredCount: number, max: number | null | undefined): boolean {
  return max != null && max > 0 && registeredCount >= max
}

export function formatParticipantRange(
  min: number | null | undefined,
  max: number | null | undefined,
): string {
  if (max != null && min != null && min > 0) return `${min}–${max} 人`
  if (max != null) return `最多 ${max} 人`
  if (min != null && min > 0) return `至少 ${min} 人`
  return ''
}
