import { Text } from '@react-email/components'
import type { Activity } from '@/shared/types'
import { formatEventDate } from '@/shared/formatDate'
import { ActivityCard, EmailShell, PrimaryButton } from './components/Layout'

interface Props {
  info: Activity
  type: 'start' | 'deadline'
  siteUrl: string
}

export default function InfoReminderEmail({ info, type, siteUrl }: Props) {
  const title = type === 'start' ? '资讯行动即将开始' : '资讯行动即将截止'
  const message =
    type === 'start'
      ? '你关注的资讯行动即将开始，请做好准备。'
      : '你关注的资讯行动即将截止，请尽快行动。'

  return (
    <EmailShell title={title} footerNote="你收到此邮件是因为你设置了资讯提醒。">
      <Text style={{ color: '#374151', margin: '0 0 16px' }}>{message}</Text>
      <ActivityCard
        title={info.title}
        date={type === 'start' ? formatEventDate(info.infoStartTime) : formatEventDate(info.infoDeadline)}
        location={info.location}
      />
      {info.infoActionUrl && (
        <PrimaryButton href={info.infoActionUrl} label={info.infoActionLabel || '查看详情'} />
      )}
      <PrimaryButton href={`${siteUrl}/event/${info.id}`} label="查看资讯页面" />
    </EmailShell>
  )
}
