'use client'

import { useAuth } from '@clerk/nextjs'
import { useEffect } from 'react'
import { ProfileSetupPrompt } from '@/src/components/ProfileSetupPrompt'
import { setAuthTokenGetter } from '@/src/lib/api'

export function AuthSetup() {
  const { getToken } = useAuth()

  useEffect(() => {
    setAuthTokenGetter(() => getToken())
  }, [getToken])

  return <ProfileSetupPrompt />
}
