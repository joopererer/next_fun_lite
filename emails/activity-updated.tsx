import { Text } from '@react-email/components'
import type { Activity } from '@/shared/types'
import { formatEventDate } from '@/shared/formatDate'
import { ActivityCard, EmailShell, PrimaryButton } from './components/Layout'

interface Props {
  activity: Activity
  changeDesc: string
  siteUrl: string
}

export default function ActivityUpdatedEmail({ activity, changeDesc, siteUrl }: Props) {
  return (
    <EmailShell title="活动信息有更新" footerNote="你收到此邮件是因为你报名了该活动。">
      <ActivityCard
        title={activity.title}
        date={formatEventDate(activity.date)}
        location={activity.location}
      />
      <Text style={{ color: '#374151', margin: '0 0 16px' }}>{changeDesc}</Text>
      <PrimaryButton href={`${siteUrl}/event/${activity.id}`} label="查看活动页面" />
    </EmailShell>
  )
}
