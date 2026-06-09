'use client'

import { useEffect, useState } from 'react'
import {
  downloadICS,
  generateICS,
  getGoogleCalendarUrl,
  getOutlookCalendarUrl,
  isWeChatInAppBrowser,
} from '@/src/lib/calendar'

interface Props {
  uid: string
  title: string
  startTime: Date
  endTime: Date
  description?: string
  url?: string
  alarmMinutesBefore?: number
  label?: string
  variant?: 'button' | 'link'
  showHint?: boolean
}

export function AddToCalendarButton({
  uid,
  title,
  startTime,
  endTime,
  description,
  url,
  alarmMinutesBefore = 15,
  label = '📅 加入日历提醒',
  variant = 'button',
  showHint = true,
}: Props) {
  const [open, setOpen] = useState(false)
  const [isWeChat, setIsWeChat] = useState(false)

  useEffect(() => {
    setIsWeChat(isWeChatInAppBrowser())
  }, [])

  const calendarPayload = {
    uid,
    title,
    startTime,
    endTime,
    description,
    url,
    alarmMinutesBefore,
  }

  const handleICS = () => {
    const ics = generateICS(calendarPayload)
    downloadICS(ics, title)
    setOpen(false)
  }

  const handleGoogle = () => {
    const googleUrl = getGoogleCalendarUrl({
      title,
      startTime,
      endTime,
      description,
      url,
    })
    window.open(googleUrl, '_blank', 'noopener,noreferrer')
    setOpen(false)
  }

  const handleOutlook = () => {
    const outlookUrl = getOutlookCalendarUrl({
      title,
      startTime,
      endTime,
      description,
      url,
    })
    window.open(outlookUrl, '_blank', 'noopener,noreferrer')
    setOpen(false)
  }

  const menuItems = isWeChat
    ? [
        {
          key: 'ics',
          icon: '📥',
          title: '下载日历文件',
          subtitle: '推荐 · 下载后打开即可加入',
          onClick: handleICS,
          highlight: true,
        },
      ]
    : [
        {
          key: 'ics',
          icon: '📥',
          title: '下载日历文件',
          subtitle: 'Outlook / 苹果日历 / Windows 日历',
          onClick: handleICS,
          highlight: false,
        },
        {
          key: 'google',
          icon: '📅',
          title: 'Google 日历',
          subtitle: '在浏览器中打开，需登录 Google',
          onClick: handleGoogle,
          highlight: false,
        },
        {
          key: 'outlook',
          icon: '📧',
          title: 'Outlook 网页版',
          subtitle: '在浏览器中打开，需登录 Microsoft',
          onClick: handleOutlook,
          highlight: false,
        },
      ]

  return (
    <div className="inline-flex flex-col items-start gap-1.5">
      <div className="relative inline-block">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={
            variant === 'button'
              ? 'text-sm border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50'
              : 'text-sm text-green-600 underline'
          }
        >
          {label}
        </button>

        {open && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <div className="absolute bottom-full mb-2 left-0 z-20 bg-white border border-gray-200 rounded-xl shadow-lg p-2 min-w-[240px] max-w-[min(280px,calc(100vw-2rem))]">
              {isWeChat && (
                <p className="px-3 py-2 mb-1 text-xs text-amber-800 bg-amber-50 rounded-lg leading-relaxed">
                  微信内无法直接打开 Google / Outlook。请下载日历文件，或点右上角「…」用 Safari /
                  Chrome 打开本页。
                </p>
              )}

              {menuItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={item.onClick}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                    item.highlight
                      ? 'bg-green-50 hover:bg-green-100 border border-green-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="block text-sm font-medium text-gray-900">
                    {item.icon} {item.title}
                  </span>
                  <span className="block text-xs text-gray-500 mt-0.5">{item.subtitle}</span>
                </button>
              ))}

              {!isWeChat && (
                <p className="px-3 pt-2 pb-1 text-xs text-gray-400 border-t border-gray-100 mt-1 leading-relaxed">
                  下载 .ics 后双击文件，即可加入本地日历（含提前 {alarmMinutesBefore} 分钟提醒）
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {showHint && !open && (
        <p className="text-xs text-gray-500 leading-relaxed max-w-sm">
          {isWeChat
            ? '建议下载日历文件；或在浏览器中打开本页后选择 Google / Outlook。'
            : '电脑端可下载 .ics 或一键打开 Google / Outlook 网页版。'}
        </p>
      )}
    </div>
  )
}
