'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/src/lib/api'
import {
  NOTIFICATION_DRAWER_OPEN_EVENT,
  NOTIFICATION_DRAWER_STATE_EVENT,
  emitNotificationDrawerState,
} from '@/src/lib/notificationUiEvents'
import { NotificationDrawer } from './NotificationDrawer'

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const refreshCount = useCallback(async () => {
    try {
      const { count } = await api.getUnreadNotificationCount()
      setUnreadCount(count)
    } catch {
      setUnreadCount(0)
    }
  }, [])

  const openDrawer = useCallback(() => {
    setDrawerOpen(true)
    emitNotificationDrawerState(true)
  }, [])

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false)
    emitNotificationDrawerState(false)
    refreshCount()
  }, [refreshCount])

  useEffect(() => {
    refreshCount()
    const onVisible = () => {
      if (document.visibilityState === 'visible') refreshCount()
    }
    const onOpen = () => openDrawer()
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener(NOTIFICATION_DRAWER_OPEN_EVENT, onOpen)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener(NOTIFICATION_DRAWER_OPEN_EVENT, onOpen)
    }
  }, [refreshCount, openDrawer])

  const badge = unreadCount > 9 ? '9+' : String(unreadCount)

  return (
    <>
      <button
        type="button"
        className="relative flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 hover:text-green-600 hover:bg-green-50 transition-colors"
        aria-label={`通知${unreadCount > 0 ? `，${unreadCount} 条未读` : ''}`}
        aria-expanded={drawerOpen}
        onClick={() => (drawerOpen ? closeDrawer() : openDrawer())}
      >
        <span aria-hidden>🔔</span>
        {unreadCount > 0 && !drawerOpen && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-medium flex items-center justify-center">
            {badge}
          </span>
        )}
      </button>
      <NotificationDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        onUnreadChange={setUnreadCount}
      />
    </>
  )
}

export { openNotificationDrawer } from '@/src/lib/notificationUiEvents'
