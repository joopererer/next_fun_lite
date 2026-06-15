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
import { notifyActivitiesChanged } from '../lib/activityEvents'
import { useT } from '../i18n/LanguageContext'

export function InfoNewPage() {
  const t = useT()
  const [created, setCreated] = useState<Activity | null>(null)
  const [eventUrl, setEventUrl] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState('')

  const handleSuccess = async (activity: Activity) => {
    const url = getEventUrl(activity.id)
    setCreated(activity)
    setEventUrl(url)
    notifyActivitiesChanged()
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
          <h2 className="text-2xl font-bold mb-3">{t.infoPublished}</h2>
          <p className="text-sm text-gray-600 mb-2 break-all">{t.infoLink}：{url}</p>
          <button type="button" className="btn-primary mb-4" onClick={() => navigator.clipboard.writeText(url)}>
            {t.copyLink}
          </button>
          {qrDataUrl && (
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-2">{t.shareQR}</p>
              <img src={qrDataUrl} alt="QR Code" className="mx-auto rounded-xl" />
            </div>
          )}
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/" className="btn-primary">{t.backToHome}</Link>
            <Link href={`/event/${created.id}`} className="btn-secondary">{t.infoLink}</Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col pb-32">
      <Header />
      <SignInGate>
        <main className="max-w-lg mx-auto px-4 py-6 page-enter w-full">
          <h1 className="text-2xl font-bold mb-1">{t.infoTitle} 📢</h1>
          <p className="text-gray-500 text-sm mb-6">{t.infoSubtitle}</p>
          <InfoForm mode="create" onSuccess={handleSuccess} />
        </main>
      </SignInGate>
      <Footer />
    </div>
  )
}
