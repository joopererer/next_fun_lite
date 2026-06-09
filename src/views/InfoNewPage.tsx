'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import QRCode from 'qrcode'
import type { Activity } from '../../shared/types'
import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'
import { SignInGate } from '../components/SignInGate'
import { InfoForm } from '../components/info/InfoForm'
import { api, getEventUrl } from '../lib/api'

export function InfoNewPage() {
  const [created, setCreated] = useState<Activity | null>(null)
  const [eventUrl, setEventUrl] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState('')

  const handleSuccess = async (activity: Activity) => {
    const url = getEventUrl(activity.id)
    setCreated(activity)
    setEventUrl(url)
    try {
      const qr = await QRCode.toDataURL(url, { width: 200 })
      setQrDataUrl(qr)
    } catch {
      setQrDataUrl('')
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
      <SignInGate message="登录后即可发布资讯">
        <main className="max-w-lg mx-auto px-4 py-6 page-enter w-full">
          <h1 className="text-2xl font-bold mb-1">分享一条资讯 📢</h1>
          <p className="text-gray-500 text-sm mb-6">抢票、展览、限时活动…无需报名，方便群内传播</p>
          <InfoForm mode="create" onSuccess={handleSuccess} />
        </main>
      </SignInGate>
      <Footer />
    </div>
  )
}
