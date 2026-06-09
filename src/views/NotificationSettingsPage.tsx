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
  const [notifyProposalRecruiting, setNotifyProposalRecruiting] = useState(true)
  const [notifyNewRecruit, setNotifyNewRecruit] = useState(false)
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
        setNotifyProposalRecruiting(p.notifyProposalRecruiting)
        setNotifyNewRecruit(p.notifyNewRecruit)
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
        notifyProposalRecruiting,
        notifyNewRecruit,
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
            <legend className="text-sm font-medium text-gray-700 mb-2">邮件通知</legend>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={notifyRegistrationChange}
                onChange={(e) => setNotifyRegistrationChange(e.target.checked)}
              />
              我报名的活动：取消或时间/地点变更时发邮件
            </label>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-medium text-gray-700 mb-2">站内通知</legend>
            <label className="flex items-center gap-2 text-sm mb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyProposalRecruiting}
                onChange={(e) => setNotifyProposalRecruiting(e.target.checked)}
              />
              我感兴趣的提议转为招募时提醒
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={notifyNewRecruit}
                onChange={(e) => setNotifyNewRecruit(e.target.checked)}
              />
              有新招募发布时提醒
            </label>
          </fieldset>

          <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 text-sm text-gray-600">
            <p className="font-medium text-gray-700 mb-1">日历提醒</p>
            <p>
              报名活动或关注资讯时，可点击「加入日历」按钮，手动添加到你的日历，获得系统级提醒。
            </p>
          </div>

          <button type="button" className="btn-primary w-full" onClick={handleSave} disabled={saving}>
            {saving ? '保存中...' : saved ? '已保存 ✓' : '保存设置'}
          </button>
        </div>
      </main>
      <Footer />
    </div>
  )
}
