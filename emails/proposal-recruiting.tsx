import { Text } from '@react-email/components'
import type { Activity } from '@/shared/types'
import { formatEventDate } from '@/shared/formatDate'
import { ActivityCard, EmailShell, PrimaryButton } from './components/Layout'

interface Props {
  recruit: Activity
  siteUrl: string
}

export default function ProposalRecruitingEmail({ recruit, siteUrl }: Props) {
  return (
    <EmailShell title="活动开始招募" footerNote="你收到此邮件是因为你关注了相关动态。">
      <Text style={{ color: '#374151', margin: '0 0 16px' }}>
        你感兴趣的活动已开始招募，名额有限，欢迎报名！
      </Text>
      <ActivityCard
        title={recruit.title}
        date={formatEventDate(recruit.date)}
        location={recruit.location}
      />
      <PrimaryButton href={`${siteUrl}/event/${recruit.id}`} label="去报名" />
    </EmailShell>
  )
}
