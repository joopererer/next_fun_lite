'use client'

import { SignInButton, UserButton, useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PROFILE_EDIT_EVENT } from '../../lib/profileEvents'
import { useT } from '@/src/i18n/LanguageContext'
import { AdminNavIcon } from './AdminNavIcon'
import { AboutInfoButton } from './AboutInfoButton'
import { NotificationBell } from '../notifications/NotificationBell'

const adminLinkClass =
  'flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 hover:text-green-600 hover:bg-green-50 transition-colors'

export function HeaderUserMenu() {
  const router = useRouter()
  const { isSignedIn } = useUser()
  const t = useT()

  if (!isSignedIn) {
    return (
      <div className="flex items-center gap-1">
        <AboutInfoButton />
        <Link href="/admin" className={adminLinkClass} aria-label={t.adminPanel} title={t.adminPanel}>
          <AdminNavIcon />
        </Link>
        <SignInButton mode="modal">
          <button
            type="button"
            className="text-sm text-green-700 font-medium px-3 py-1.5 rounded-lg hover:bg-green-50"
          >
            {t.signIn}
          </button>
        </SignInButton>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <AboutInfoButton />
      <NotificationBell />
      <Link href="/admin" className={adminLinkClass} aria-label={t.adminPanel} title={t.adminPanel}>
        <AdminNavIcon />
      </Link>
      <UserButton>
        <UserButton.MenuItems>
          <UserButton.Action
            label={t.editProfile}
            labelIcon={<span aria-hidden>✏️</span>}
            onClick={() => window.dispatchEvent(new CustomEvent(PROFILE_EDIT_EVENT))}
          />
          <UserButton.Action
            label={t.notificationSettings}
            labelIcon={<span aria-hidden>📬</span>}
            onClick={() => router.push('/settings/notifications')}
          />
          <UserButton.Action
            label={t.myRegistrations}
            labelIcon={<span aria-hidden>📋</span>}
            onClick={() => router.push('/my')}
          />
        </UserButton.MenuItems>
      </UserButton>
    </div>
  )
}
