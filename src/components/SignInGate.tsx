'use client'

import { SignInButton, useUser } from '@clerk/nextjs'
import { useT } from '../i18n/LanguageContext'

interface Props {
  children: React.ReactNode
  messageKey?: 'signInGateDefault'
}

export function SignInGate({ children, messageKey = 'signInGateDefault' }: Props) {
  const { isSignedIn, isLoaded } = useUser()
  const t = useT()

  if (!isLoaded) {
    return <div className="text-center text-gray-400 py-16">{t.loading}</div>
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center px-4">
        <p className="text-gray-600 mb-4 text-center">{t[messageKey]}</p>
        <SignInButton mode="modal">
          <button type="button" className="btn-primary">{t.signInButton}</button>
        </SignInButton>
      </div>
    )
  }

  return <>{children}</>
}
