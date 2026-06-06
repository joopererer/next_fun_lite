'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import type { Profile } from '../../shared/types'
import { api } from '../lib/api'
import { ProfileModal } from './ProfileModal'

import { PROFILE_EDIT_EVENT } from '../lib/profileEvents'

const SKIP_KEY = 'nfl_profile_setup_skipped'

export function ProfileSetupPrompt() {
  const { isSignedIn, isLoaded, user } = useUser()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'setup' | 'edit'>('setup')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const onEdit = () => {
      setMode('edit')
      api.getProfile()
        .then(setProfile)
        .catch(() => setProfile(null))
      setOpen(true)
    }
    window.addEventListener(PROFILE_EDIT_EVENT, onEdit)
    return () => window.removeEventListener(PROFILE_EDIT_EVENT, onEdit)
  }, [])

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
      .then((p) => {
        if (cancelled) return
        if (!p) {
          setMode('setup')
          setProfile(null)
          setOpen(true)
        }
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
      mode={mode}
      initialNickname={profile?.nickname}
      initialWechat={profile?.wechat}
      onClose={() => {
        if (mode === 'setup') sessionStorage.setItem(SKIP_KEY, '1')
        setOpen(false)
      }}
      onSaved={() => {
        sessionStorage.removeItem(SKIP_KEY)
        setOpen(false)
      }}
    />
  )
}
