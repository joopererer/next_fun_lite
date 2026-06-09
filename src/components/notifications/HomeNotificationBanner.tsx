'use client'

import { useUser } from '@clerk/nextjs'
import { useCallback, useEffect, useState } from 'react'
import {
  NOTIFICATION_DRAWER_OPEN_EVENT,
  NOTIFICATION_DRAWER_STATE_EVENT,
  openNotificationDrawer,
} from '@/src/lib/notificationUiEvents'
import { api } from '@/src/lib/api'

const DISMISS_KEY = 'nfl_notification_banner_dismissed'

export function HomeNotificationBanner() {
  const { isSignedIn, isLoaded } = useUser()
  const [count, setCount] = useState(0)
  const [dismissed, setDismissed] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    setDismissed(sessionStorage.getItem(DISMISS_KEY) === '1')
  }, [])

  const refreshCount = useCallback(() => {
    if (!isLoaded || !isSignedIn) return
    api
      .getUnreadNotificationCount()
      .then(({ count: c }) => setCount(c))
      .catch(() => setCount(0))
  }, [isLoaded, isSignedIn])

  useEffect(() => {
    refreshCount()
  }, [refreshCount])

  useEffect(() => {
    const onDrawerState = (e: Event) => {
      const open = (e as CustomEvent<{ open: boolean }>).detail?.open ?? false
      setDrawerOpen(open)
    }
    const onDrawerOpened = () => {
      sessionStorage.setItem(DISMISS_KEY, '1')
      setDismissed(true)
    }
    window.addEventListener(NOTIFICATION_DRAWER_STATE_EVENT, onDrawerState)
    window.addEventListener(NOTIFICATION_DRAWER_OPEN_EVENT, onDrawerOpened)
    return () => {
      window.removeEventListener(NOTIFICATION_DRAWER_STATE_EVENT, onDrawerState)
      window.removeEventListener(NOTIFICATION_DRAWER_OPEN_EVENT, onDrawerOpened)
    }
  }, [])

  if (!isSignedIn || count <= 0 || dismissed || drawerOpen) return null

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, '1')
    setDismissed(true)
  }

  const handleView = () => {
    sessionStorage.setItem(DISMISS_KEY, '1')
    setDismissed(true)
    openNotificationDrawer()
  }

  return (
    <div className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-900">
      <span>🔔 你有 {count} 条新通知</span>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          className="text-green-700 font-medium hover:underline"
          onClick={handleView}
        >
          查看
        </button>
        <button type="button" className="text-green-600/70 hover:text-green-800 px-1" onClick={dismiss} aria-label="关闭">
          ×
        </button>
      </div>
    </div>
  )
}
