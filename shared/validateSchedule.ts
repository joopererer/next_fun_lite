/** Shown when dateEnd is before now */
export const PAST_END_TIME_MESSAGE =
  '结束时间已早于当前时间，请核对日程后再提交'

export function isEndTimeInPast(
  dateEnd: string | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!dateEnd?.trim()) return false
  const end = new Date(dateEnd)
  if (Number.isNaN(end.getTime())) return false
  return end.getTime() < now.getTime()
}
