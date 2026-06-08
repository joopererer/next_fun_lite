import { formatEventDate } from './user'

export function buildRecruitGroupMessage(params: {
  title: string
  date: string | null
  location: string
  eventUrl: string
  proposalTitle?: string
  interestedCount?: number
}): string {
  const { title, date, location, eventUrl, proposalTitle, interestedCount } = params
  const when = date ? formatEventDate(date) : '时间待定'
  const where = location || '地点待定'

  const lines = ['【招募开始】' + title, `📅 ${when}`, `📍 ${where}`]

  if (proposalTitle && interestedCount && interestedCount > 0) {
    lines.push(
      '',
      `之前对「${proposalTitle}」感兴趣的朋友（共 ${interestedCount} 人），正式招募开始了，欢迎报名：`,
    )
  } else {
    lines.push('', '欢迎报名：')
  }

  lines.push(eventUrl)
  return lines.join('\n')
}
