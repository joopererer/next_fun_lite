'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { ProfileModal } from './ProfileModal'

const SKIP_KEY = 'nfl_profile_setup_skipped'

export function ProfileSetupPrompt() {
  const { isSignedIn, isLoaded, user } = useUser()
  const [open, setOpen] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) {
      setOpen(false)
      setChecked(false)
      return
    }
    if (sessionStorage.getItem(SKIP_KEY) === '1') {
      setChecked(true)
      return
    }

    let cancelled = false
    api.getProfile()
      .then((profile) => {
        if (cancelled) return
        if (!profile) setOpen(true)
        setChecked(true)
      })
      .catch(() => {
        if (!cancelled) setChecked(true)
      })

    return () => {
      cancelled = true
    }
  }, [isLoaded, isSignedIn, user?.id])

  if (!checked || !isSignedIn) return null

  return (
    <ProfileModal
      open={open}
      mode="setup"
      onClose={() => {
        sessionStorage.setItem(SKIP_KEY, '1')
        setOpen(false)
      }}
      onSaved={() => {
        sessionStorage.removeItem(SKIP_KEY)
        setOpen(false)
      }}
    />
  )
}
