'use client'

import { SignInButton, UserButton, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import type { Profile } from '../../../shared/types'
import { ProfileModal } from '../ProfileModal'

export function HeaderUserMenu() {
  const router = useRouter()
  const { isSignedIn } = useUser()
  const [profileOpen, setProfileOpen] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    if (!profileOpen || !isSignedIn) return
    api.getProfile()
      .then(setProfile)
      .catch(() => setProfile(null))
  }, [profileOpen, isSignedIn])

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <button
          type="button"
          className="text-sm text-green-700 font-medium px-3 py-1.5 rounded-lg hover:bg-green-50"
        >
          登录 / 注册
        </button>
      </SignInButton>
    )
  }

  return (
    <>
      <UserButton>
        <UserButton.MenuItems>
          <UserButton.Action
            label="编辑资料"
            labelIcon={<span aria-hidden>✏️</span>}
            onClick={() => setProfileOpen(true)}
          />
          <UserButton.Action
            label="我的报名"
            labelIcon={<span aria-hidden>📋</span>}
            onClick={() => router.push('/my')}
          />
        </UserButton.MenuItems>
      </UserButton>
      <ProfileModal
        open={profileOpen}
        mode="edit"
        initialNickname={profile?.nickname}
        initialWechat={profile?.wechat}
        onClose={() => setProfileOpen(false)}
        onSaved={() => setProfileOpen(false)}
      />
    </>
  )
}
