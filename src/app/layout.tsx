import { ClerkProvider } from '@clerk/nextjs'
import { zhCN } from '@clerk/localizations'
import type { Metadata } from 'next'
import { AuthSetup } from './AuthSetup'
import './globals.css'

export const metadata: Metadata = {
  title: '快乐制造局',
  description: 'Next Fun Club · 巴黎华人社群活动组织',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider localization={zhCN}>
      <html lang="zh">
        <body>
          <AuthSetup />
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
