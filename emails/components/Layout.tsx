import type { ReactNode } from 'react'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Section,
  Text,
} from '@react-email/components'

export function EmailHeader() {
  return (
    <Text style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 8px' }}>
      Next Fun Club · 巴黎
    </Text>
  )
}

export function EmailFooter({ note }: { note: string }) {
  return (
    <>
      <Hr style={{ borderColor: '#e5e7eb', margin: '24px 0' }} />
      <Text style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>{note}</Text>
    </>
  )
}

export function EmailShell({
  title,
  children,
  footerNote,
}: {
  title: string
  children: ReactNode
  footerNote: string
}) {
  return (
    <Html lang="zh">
      <Head />
      <Body style={{ backgroundColor: '#f9fafb', fontFamily: 'sans-serif', margin: 0, padding: '24px 0' }}>
        <Container style={{ maxWidth: '480px', margin: '0 auto', padding: '0 24px' }}>
          <EmailHeader />
          <Heading style={{ fontSize: '20px', color: '#111827', margin: '0 0 16px' }}>{title}</Heading>
          {children}
          <EmailFooter note={footerNote} />
        </Container>
      </Body>
    </Html>
  )
}

export function ActivityCard({
  title,
  date,
  location,
}: {
  title: string
  date?: string | null
  location?: string
}) {
  return (
    <Section style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
      <Text style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 8px' }}>{title}</Text>
      {date && <Text style={{ margin: '0 0 4px', color: '#374151' }}>📅 {date}</Text>}
      {location && <Text style={{ margin: 0, color: '#374151' }}>📍 {location}</Text>}
    </Section>
  )
}

export function PrimaryButton({ href, label }: { href: string; label: string }) {
  return (
    <Button
      href={href}
      style={{
        backgroundColor: '#16a34a',
        color: '#fff',
        borderRadius: '6px',
        padding: '10px 20px',
        textDecoration: 'none',
        display: 'inline-block',
        marginTop: '8px',
      }}
    >
      {label}
    </Button>
  )
}
