import { Text } from '@react-email/components'
import type { Activity } from '@/shared/types'
import { formatEventDate } from '@/shared/formatDate'
import { ActivityCard, EmailShell, PrimaryButton } from './components/Layout'

interface Props {
  activity: Activity
  siteUrl: string
}

export default function ActivityReminderEmail({ activity, siteUrl }: Props) {
  const location = activity.meetingLocation || activity.location

  return (
    <EmailShell title="明天的活动提醒" footerNote="你收到此邮件是因为你报名了该活动。">
      <Text style={{ color: '#374151', margin: '0 0 16px' }}>
        你报名的活动将在约 24 小时内开始，请做好准备。
      </Text>
      <ActivityCard title={activity.title} date={formatEventDate(activity.date)} location={location} />
      <PrimaryButton href={`${siteUrl}/event/${activity.id}`} label="查看活动页面" />
    </EmailShell>
  )
}
