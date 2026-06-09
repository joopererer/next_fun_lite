import { Text } from '@react-email/components'
import type { Activity } from '@/shared/types'
import { getCancelReasonLabel } from '@/shared/activityStatus'
import { formatEventDate } from '@/shared/formatDate'
import { ActivityCard, EmailShell, PrimaryButton } from './components/Layout'

interface Props {
  activity: Activity
  siteUrl: string
}

export default function ActivityCancelledEmail({ activity, siteUrl }: Props) {
  const reason = activity.cancelNote?.trim() || (activity.cancelReason ? getCancelReasonLabel(activity.cancelReason) : '')

  return (
    <EmailShell title="活动已取消" footerNote="你收到此邮件是因为你报名了该活动。">
      <ActivityCard
        title={activity.title}
        date={formatEventDate(activity.date)}
        location={activity.location}
      />
      <Text style={{ color: '#ef4444', margin: '0 0 8px' }}>❌ 本次活动已取消</Text>
      {reason && <Text style={{ color: '#6b7280', margin: '0 0 16px' }}>原因：{reason}</Text>}
      {activity.organizerContact && (
        <Text style={{ color: '#374151', margin: '0 0 16px' }}>
          如有疑问请联系发起人 {activity.organizerName}：{activity.organizerContact}
        </Text>
      )}
      <PrimaryButton href={`${siteUrl}/event/${activity.id}`} label="查看活动页面" />
    </EmailShell>
  )
}
