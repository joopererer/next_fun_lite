'use client'

import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import type { Notification } from '@/shared/types'
import { api } from '@/src/lib/api'
import { formatRelativeTime } from '@/src/lib/user'

interface Props {
  open: boolean
  onClose: () => void
  onUnreadChange?: (count: number) => void
}

export function NotificationDrawer({ open, onClose, onUnreadChange }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const list = await api.getNotifications()
      setNotifications(list)
      onUnreadChange?.(list.filter((n) => !n.isRead).length)
    } catch {
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }, [onUnreadChange])

  useEffect(() => {
    if (open) load()
  }, [open, load])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const handleMarkRead = async (notification: Notification) => {
    if (notification.isRead) {
      if (notification.actionUrl) window.location.href = notification.actionUrl
      return
    }
    try {
      await api.markNotificationRead(notification.id)
      setNotifications((prev) => {
        const next = prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
        onUnreadChange?.(next.filter((n) => !n.isRead).length)
        return next
      })
      if (notification.actionUrl) window.location.href = notification.actionUrl
    } catch {
      if (notification.actionUrl) window.location.href = notification.actionUrl
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      onUnreadChange?.(0)
    } catch {
      /* ignore */
    }
  }

  if (!open || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      <button
        type="button"
        className="absolute inset-0 bg-black/30"
        aria-label="关闭通知"
        onClick={onClose}
      />
      <aside
        className="absolute top-0 right-0 bottom-0 w-full max-w-sm bg-white shadow-xl flex flex-col min-h-0"
        role="dialog"
        aria-label="通知列表"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
          <h2 className="font-semibold text-gray-900">🔔 通知</h2>
          <div className="flex items-center gap-2">
            {notifications.some((n) => !n.isRead) && (
              <button
                type="button"
                className="text-xs text-green-700 hover:underline"
                onClick={handleMarkAllRead}
              >
                全部标为已读
              </button>
            )}
            <button type="button" className="text-gray-400 hover:text-gray-600 px-2" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          {loading && <p className="text-sm text-gray-500 p-4">加载中...</p>}
          {!loading && notifications.length === 0 && (
            <p className="text-sm text-gray-500 p-4">没有通知</p>
          )}
          {!loading &&
            notifications.map((n) => (
              <button
                key={n.id}
                type="button"
                className="w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors"
                onClick={() => handleMarkRead(n)}
              >
                <div className="flex gap-2">
                  {!n.isRead && (
                    <span className="mt-1.5 w-2 h-2 rounded-full bg-green-500 shrink-0" aria-hidden />
                  )}
                  <div className={n.isRead ? 'pl-4' : ''}>
                    <p className={`text-sm ${n.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatRelativeTime(n.createdAt)}</p>
                    {n.actionUrl && (
                      <span className="text-xs text-green-700 mt-1 inline-block">查看 →</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
        </div>

        <div className="p-3 border-t border-gray-100 text-center shrink-0">
          <Link href="/settings/notifications" className="text-xs text-gray-500 hover:text-green-700" onClick={onClose}>
            通知设置
          </Link>
        </div>
      </aside>
    </div>,
    document.body,
  )
}
