import { ClerkProvider } from '@clerk/nextjs'
import { zhCN } from '@clerk/localizations'
import type { Metadata } from 'next'
import { AuthSetup } from './AuthSetup'
import { LanguageProvider } from '@/src/i18n/LanguageContext'
import './globals.css'

export const metadata: Metadata = {
  title: 'Next Fun',
  description: 'Next Fun Club · Paris Chinese Community',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider localization={zhCN}>
      <html lang="zh">
        <body>
          <AuthSetup />
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
