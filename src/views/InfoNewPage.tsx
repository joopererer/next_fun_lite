'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Activity, ActivityCategory } from '../../shared/types'
import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'
import { api, getEventUrl } from '../lib/api'
import { ACTIVITY_CATEGORIES } from '../lib/categories'
import { getClerkDisplayName } from '../lib/displayName'
import { isEndTimeInPast, PAST_END_TIME_MESSAGE } from '../lib/validateSchedule'

export function InfoNewPage() {
  const { user, isSignedIn, isLoaded } = useUser()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<ActivityCategory>('culture')
  const [sourceUrl, setSourceUrl] = useState('')
  const [infoStartTime, setInfoStartTime] = useState('')
  const [infoDeadline, setInfoDeadline] = useState('')
  const [infoPrice, setInfoPrice] = useState('')
  const [infoActionLabel, setInfoActionLabel] = useState('')
  const [infoActionUrl, setInfoActionUrl] = useState('')
  const [organizerName, setOrganizerName] = useState('')
  const [nameTouched, setNameTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [created, setCreated] = useState<Activity | null>(null)
  const [eventUrl, setEventUrl] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState('')

  useEffect(() => {
    if (!isLoaded || nameTouched || !isSignedIn) return
    const clerkName = getClerkDisplayName(user)
    api.getProfile()
      .then((p) => {
        setOrganizerName(p?.nickname?.trim() || clerkName)
      })
      .catch(() => {
        setOrganizerName(clerkName)
      })
  }, [isLoaded, isSignedIn, user, nameTouched])

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('请填写标题')
      return
    }
    if (!organizerName.trim()) {
      alert('请填写发布人昵称')
      return
    }
    if (isEndTimeInPast(infoDeadline || undefined)) {
      alert(PAST_END_TIME_MESSAGE)
      return
    }
    if (infoStartTime && infoDeadline) {
      const start = new Date(infoStartTime).getTime()
      const end = new Date(infoDeadline).getTime()
      if (!Number.isNaN(start) && !Number.isNaN(end) && start >= end) {
        alert('行动开始时间必须早于截止时间')
        return
      }
    }

    setSubmitting(true)
    try {
      const activity = await api.createInfo({
        title: title.trim(),
        description: description.trim(),
        category,
        sourceUrl: sourceUrl.trim(),
        organizerName: organizerName.trim(),
        infoStartTime: infoStartTime ? new Date(infoStartTime).toISOString() : undefined,
        infoDeadline: infoDeadline ? new Date(infoDeadline).toISOString() : undefined,
        infoPrice: infoPrice.trim() || undefined,
        infoActionLabel: infoActionLabel.trim() || undefined,
        infoActionUrl: infoActionUrl.trim() || undefined,
      })
      const url = getEventUrl(activity.id)
      setCreated(activity)
      setEventUrl(url)
      try {
        const { default: QRCode } = await import('qrcode')
        const qr = await QRCode.toDataURL(url, { width: 200 })
        setQrDataUrl(qr)
      } catch {
        setQrDataUrl('')
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : '发布失败')
    } finally {
      setSubmitting(false)
    }
  }

  if (created) {
    const url = eventUrl || getEventUrl(created.id)
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 max-w-lg mx-auto px-4 py-16 text-center page-enter w-full">
          <div className="text-5xl mb-4">📢</div>
          <h2 className="text-2xl font-bold mb-3">资讯已发布！</h2>
          <p className="text-sm text-gray-600 mb-2 break-all">链接：{url}</p>
          <button type="button" className="btn-primary mb-4" onClick={() => navigator.clipboard.writeText(url)}>
            复制链接
          </button>
          {qrDataUrl && (
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-2">分享二维码</p>
              <img src={qrDataUrl} alt="QR Code" className="mx-auto rounded-xl" />
            </div>
          )}
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/" className="btn-primary">回到首页</Link>
            <Link href={`/event/${created.id}`} className="btn-secondary">查看资讯</Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col pb-32">
      <Header />
      <main className="max-w-lg mx-auto px-4 py-6 page-enter w-full">
        <h1 className="text-2xl font-bold mb-1">分享一条资讯 📢</h1>
        <p className="text-gray-500 text-sm mb-6">抢票、展览、限时活动…无需报名，方便群内传播</p>

        <div className="space-y-4 mb-8">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">标题 *</label>
            <input className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">内容/简介</label>
            <textarea className="input-field min-h-[100px]" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">活动类型</label>
            <select className="input-field" value={category} onChange={(e) => setCategory(e.target.value as ActivityCategory)}>
              {ACTIVITY_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">参考链接</label>
            <input className="input-field" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">行动开始时间（选填）</label>
            <input type="datetime-local" className="input-field" value={infoStartTime} onChange={(e) => setInfoStartTime(e.target.value)} />
            <p className="text-xs text-gray-400 mt-1">留空表示现在即可操作</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">行动截止时间（选填）</label>
            <input type="datetime-local" className="input-field" value={infoDeadline} onChange={(e) => setInfoDeadline(e.target.value)} />
            <p className="text-xs text-gray-400 mt-1">留空表示无截止</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">价格信息（选填）</label>
            <input className="input-field" value={infoPrice} onChange={(e) => setInfoPrice(e.target.value)} placeholder="如 39€起" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">按钮文字（选填）</label>
              <input className="input-field" value={infoActionLabel} onChange={(e) => setInfoActionLabel(e.target.value)} placeholder="立即抢票" />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">按钮链接（选填）</label>
              <input className="input-field" value={infoActionUrl} onChange={(e) => setInfoActionUrl(e.target.value)} placeholder="https://..." />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">发布人昵称 *</label>
            {isSignedIn ? (
              <p className="text-xs text-gray-400 mb-1">已登录，已自动填入你的昵称，可修改</p>
            ) : (
              <p className="text-xs text-gray-400 mb-1">未登录也可发布，请填写便于识别的昵称</p>
            )}
            <input
              className="input-field"
              value={organizerName}
              onChange={(e) => {
                setNameTouched(true)
                setOrganizerName(e.target.value)
              }}
              placeholder={isSignedIn ? undefined : '如 James'}
            />
          </div>
        </div>

        <button type="button" className="btn-primary w-full text-lg" onClick={handleSubmit} disabled={submitting}>
          {submitting ? '发布中...' : '发布资讯 📢'}
        </button>
      </main>
      <Footer />
    </div>
  )
}
