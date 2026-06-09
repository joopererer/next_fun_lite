'use client'

export function isWeChatInAppBrowser(): boolean {
  if (typeof navigator === 'undefined') return false
  return /MicroMessenger/i.test(navigator.userAgent)
}

function sanitizeFilename(name: string): string {
  return name.replace(/[<>:"/\\|?*\n\r]/g, '_').trim().slice(0, 80) || 'event'
}

function formatIcsUtc(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

function buildCalendarDetails(description?: string, url?: string): string {
  return [description, url ? `链接：${url}` : ''].filter(Boolean).join('\n\n')
}

export function generateICS({
  uid,
  title,
  startTime,
  endTime,
  description,
  url,
  alarmMinutesBefore = 0,
}: {
  uid: string
  title: string
  startTime: Date
  endTime: Date
  description?: string
  url?: string
  alarmMinutesBefore?: number
}): string {
  const descLine = buildCalendarDetails(description, url).replace(/\n/g, '\\n')

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Next Fun Club//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}@nextfunclub`,
    `DTSTART:${formatIcsUtc(startTime)}`,
    `DTEND:${formatIcsUtc(endTime)}`,
    `SUMMARY:${title}`,
    descLine ? `DESCRIPTION:${descLine}` : '',
    url ? `URL:${url}` : '',
    'STATUS:CONFIRMED',
  ].filter(Boolean)

  if (alarmMinutesBefore > 0) {
    lines.push(
      'BEGIN:VALARM',
      `TRIGGER:-PT${alarmMinutesBefore}M`,
      'ACTION:DISPLAY',
      `DESCRIPTION:${title}`,
      'END:VALARM',
    )
  }

  lines.push('END:VEVENT', 'END:VCALENDAR')
  return lines.join('\r\n')
}

export function downloadICS(ics: string, filename: string) {
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${sanitizeFilename(filename)}.ics`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function getGoogleCalendarUrl({
  title,
  startTime,
  endTime,
  description,
  url,
}: {
  title: string
  startTime: Date
  endTime: Date
  description?: string
  url?: string
}): string {
  const details = buildCalendarDetails(description, url)

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${formatIcsUtc(startTime)}/${formatIcsUtc(endTime)}`,
    ...(details ? { details } : {}),
  })

  return `https://calendar.google.com/calendar/render?${params}`
}

export function getOutlookCalendarUrl({
  title,
  startTime,
  endTime,
  description,
  url,
}: {
  title: string
  startTime: Date
  endTime: Date
  description?: string
  url?: string
}): string {
  const body = buildCalendarDetails(description, url)

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: title,
    startdt: startTime.toISOString(),
    enddt: endTime.toISOString(),
    ...(body ? { body } : {}),
  })

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params}`
}
