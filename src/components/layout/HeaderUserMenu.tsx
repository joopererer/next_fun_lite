'use client'

import { SignInButton, UserButton, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { PROFILE_EDIT_EVENT } from '../../lib/profileEvents'

export function HeaderUserMenu() {
  const router = useRouter()
  const { isSignedIn } = useUser()

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
    <UserButton>
      <UserButton.MenuItems>
        <UserButton.Action
          label="编辑资料"
          labelIcon={<span aria-hidden>✏️</span>}
          onClick={() => window.dispatchEvent(new CustomEvent(PROFILE_EDIT_EVENT))}
        />
        <UserButton.Action
          label="我的报名"
          labelIcon={<span aria-hidden>📋</span>}
          onClick={() => router.push('/my')}
        />
      </UserButton.MenuItems>
    </UserButton>
  )
}
