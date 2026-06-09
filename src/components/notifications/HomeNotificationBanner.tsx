'use client'

import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { Notification } from '@/shared/types'
import { api } from '@/src/lib/api'
import { openNotificationDrawer } from '@/src/lib/notificationUiEvents'

export function HomeNotificationBanner() {
  const { isSignedIn, isLoaded } = useUser()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    api
      .getNotifications({ unread: true, limit: 3 })
      .then(({ notifications: list }) => setNotifications(list))
      .catch(() => setNotifications([]))
  }, [isLoaded, isSignedIn])

  if (!isSignedIn || dismissed || notifications.length === 0) return null

  const handleDismiss = () => {
    setDismissed(true)
  }

  if (notifications.length === 1) {
    const n = notifications[0]
    return (
      <div className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-900">
        <button
          type="button"
          className="flex items-center gap-2 min-w-0 flex-1 text-left"
          onClick={openNotificationDrawer}
        >
          <span>🔔</span>
          <span className="truncate">{n.title}</span>
          {n.actionUrl && (
            <Link
              href={n.actionUrl}
              className="text-green-600 underline shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              查看
            </Link>
          )}
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="text-green-600/70 hover:text-green-800 px-1 shrink-0"
          aria-label="关闭"
        >
          ×
        </button>
      </div>
    )
  }

  const first = notifications[0]
  return (
    <div className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-900">
      <button
        type="button"
        className="flex items-center gap-2 min-w-0 flex-wrap flex-1 text-left"
        onClick={openNotificationDrawer}
      >
        <span>🔔</span>
        <span>你有 {notifications.length} 条新通知</span>
        <span className="text-gray-400">·</span>
        {first.actionUrl ? (
          <Link
            href={first.actionUrl}
            className="text-green-600 underline truncate"
            onClick={(e) => e.stopPropagation()}
          >
            {first.title}
          </Link>
        ) : (
          <span className="truncate">{first.title}</span>
        )}
      </button>
      <button
        type="button"
        onClick={handleDismiss}
        className="text-green-600/70 hover:text-green-800 px-1 shrink-0"
        aria-label="关闭"
      >
        ×
      </button>
    </div>
  )
}
