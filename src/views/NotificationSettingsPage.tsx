'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Profile } from '@/shared/types'
import { api } from '@/src/lib/api'
import { Header } from '@/src/components/layout/Header'
import { Footer } from '@/src/components/layout/Footer'

export function NotificationSettingsPage() {
  const { user, isLoaded } = useUser()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [notificationEmail, setNotificationEmail] = useState('')
  const [notifyRegistrationChange, setNotifyRegistrationChange] = useState(true)
  const [notifyActivityReminder, setNotifyActivityReminder] = useState(true)
  const [notifyProposalRecruiting, setNotifyProposalRecruiting] = useState(true)
  const [notifyNewRecruit, setNotifyNewRecruit] = useState(false)
  const [notifyInfoReminder, setNotifyInfoReminder] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const loginEmail = user?.emailAddresses[0]?.emailAddress ?? ''

  useEffect(() => {
    if (!isLoaded) return
    api
      .getProfile()
      .then((p) => {
        if (!p) return
        setProfile(p)
        setNotificationEmail(p.notificationEmail ?? '')
        setNotifyRegistrationChange(p.notifyRegistrationChange)
        setNotifyActivityReminder(p.notifyActivityReminder)
        setNotifyProposalRecruiting(p.notifyProposalRecruiting)
        setNotifyNewRecruit(p.notifyNewRecruit)
        setNotifyInfoReminder(p.notifyInfoReminder)
      })
      .catch(() => {})
  }, [isLoaded])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const updated = await api.saveProfile({
        nickname: profile?.nickname,
        notificationEmail: notificationEmail.trim() || undefined,
        notifyRegistrationChange,
        notifyActivityReminder,
        notifyProposalRecruiting,
        notifyNewRecruit,
        notifyInfoReminder,
      })
      setProfile(updated)
      setSaved(true)
    } catch (err) {
      alert(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-warm-bg">
      <Header />
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
        <Link href="/" className="text-sm text-gray-500 hover:text-green-700 mb-4 inline-block">
          ← 返回首页
        </Link>
        <h1 className="text-xl font-bold text-gray-900 mb-6">📬 通知设置</h1>

        <div className="space-y-6">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">通知邮箱</label>
            <input
              className="input-field"
              type="email"
              value={notificationEmail}
              onChange={(e) => setNotificationEmail(e.target.value)}
              placeholder={loginEmail || '留空则使用登录邮箱'}
            />
            {loginEmail && (
              <p className="text-xs text-gray-500 mt-1">留空则使用登录邮箱（{loginEmail}）</p>
            )}
          </div>

          <fieldset>
            <legend className="text-sm font-medium text-gray-700 mb-2">我报名的活动</legend>
            <label className="flex items-center gap-2 text-sm mb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyRegistrationChange}
                onChange={(e) => setNotifyRegistrationChange(e.target.checked)}
              />
              活动取消或时间/地点变更
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={notifyActivityReminder}
                onChange={(e) => setNotifyActivityReminder(e.target.checked)}
              />
              活动开始前24小时提醒
            </label>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-medium text-gray-700 mb-2">我感兴趣的提议</legend>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={notifyProposalRecruiting}
                onChange={(e) => setNotifyProposalRecruiting(e.target.checked)}
              />
              提议转为招募时通知
            </label>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-medium text-gray-700 mb-2">全站动态</legend>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={notifyNewRecruit}
                onChange={(e) => setNotifyNewRecruit(e.target.checked)}
              />
              有新招募发布（可能较频繁）
            </label>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-medium text-gray-700 mb-2">资讯提醒</legend>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={notifyInfoReminder}
                onChange={(e) => setNotifyInfoReminder(e.target.checked)}
              />
              我关注的资讯：行动开始前1小时 / 截止前3小时
            </label>
          </fieldset>

          <button type="button" className="btn-primary w-full" onClick={handleSave} disabled={saving}>
            {saving ? '保存中...' : saved ? '已保存 ✓' : '保存设置'}
          </button>
        </div>
      </main>
      <Footer />
    </div>
  )
}
