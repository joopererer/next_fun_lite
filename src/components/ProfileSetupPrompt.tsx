'use client'

import { useUser } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import type { Profile } from '../../shared/types'
import { api } from '../lib/api'
import { ProfileModal } from './ProfileModal'
import { PROFILE_EDIT_EVENT } from '../lib/profileEvents'

const SKIP_KEY_PREFIX = 'nfl_profile_setup_skipped_'

const AUTO_PROMPT_ROUTES = new Set(['/', '/my'])

function isAutoPromptRoute(pathname: string): boolean {
  return AUTO_PROMPT_ROUTES.has(pathname)
}

function getSkipKey(userId: string): string {
  return `${SKIP_KEY_PREFIX}${userId}`
}

export function ProfileSetupPrompt() {
  const pathname = usePathname()
  const { isSignedIn, isLoaded, user } = useUser()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'setup' | 'edit'>('setup')
  const [profile, setProfile] = useState<Profile | null>(null)
  const setupCheckedRef = useRef<string | null>(null)

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
      setupCheckedRef.current = null
      return
    }

    if (!isAutoPromptRoute(pathname)) return

    if (localStorage.getItem(getSkipKey(user.id)) === '1') return

    if (setupCheckedRef.current === user.id) return

    let cancelled = false
    api.getProfile()
      .then((p) => {
        if (cancelled) return
        setupCheckedRef.current = user.id
        if (!p) {
          setMode('setup')
          setProfile(null)
          setOpen(true)
        } else {
          setOpen(false)
        }
      })
      .catch(() => {
        if (!cancelled) setupCheckedRef.current = user.id
      })

    return () => {
      cancelled = true
    }
  }, [isLoaded, isSignedIn, user?.id, pathname])

  if (!isSignedIn) return null

  return (
    <ProfileModal
      open={open}
      mode={mode}
      initialNickname={profile?.nickname}
      initialWechat={profile?.wechat}
      onClose={() => {
        if (mode === 'setup' && user?.id) {
          localStorage.setItem(getSkipKey(user.id), '1')
        }
        setOpen(false)
      }}
      onSaved={() => {
        if (user?.id) localStorage.removeItem(getSkipKey(user.id))
        setOpen(false)
      }}
    />
  )
}
