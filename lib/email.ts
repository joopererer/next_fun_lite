import type { ReactElement } from 'react'
import { render } from '@react-email/render'
import { Resend } from 'resend'
import type { EnvConfig } from '@/shared/types'
import { getEnvConfig } from '@/lib/env'
import ActivityCancelledEmail from '@/emails/activity-cancelled'
import ActivityUpdatedEmail from '@/emails/activity-updated'

export type EmailTemplate = 'activity-cancelled' | 'activity-updated'

const TEMPLATE_RENDERERS: Record<EmailTemplate, (props: Record<string, unknown>) => ReactElement> = {
  'activity-cancelled': (props) => ActivityCancelledEmail(props as never),
  'activity-updated': (props) => ActivityUpdatedEmail(props as never),
}

export async function sendEmail(
  env: EnvConfig | undefined,
  {
    to,
    subject,
    template,
    props,
  }: {
    to: string
    subject: string
    template: EmailTemplate
    props: Record<string, unknown>
  },
): Promise<void> {
  const config = getEnvConfig(env)
  const apiKey = config.RESEND_API_KEY
  if (!apiKey) {
    console.warn(`Email skipped [${template}] — RESEND_API_KEY not configured`)
    return
  }

  const fromEmail = config.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'
  const fromName = config.RESEND_FROM_NAME ?? 'Next Fun Club'
  const recipient = config.RESEND_TEST_EMAIL?.trim() || to

  try {
    const resend = new Resend(apiKey)
    const html = await render(TEMPLATE_RENDERERS[template](props))
    await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: recipient,
      subject,
      html,
    })
  } catch (err) {
    console.error(`Email send failed [${template}] to ${to}:`, err)
  }
}
