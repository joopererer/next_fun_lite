'use client'

import { useUser } from '@clerk/nextjs'
import QRCode from 'qrcode'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'
import { SignInGate } from '../components/SignInGate'
import type { SimilarProposalMatch } from '../../shared/activityDedupe'
import type { Activity, ActivityCategory, FeeLevel, OrganizerContactType, ParseResult } from '../../shared/types'
import { OrganizerContactFields } from '../components/contact/OrganizerContactFields'
import { SimilarProposalsDialog } from '../components/SimilarProposalsDialog'
import { api, getEventUrl } from '../lib/api'
import { notifyActivitiesChanged } from '../lib/activityEvents'
import { useT } from '../i18n/LanguageContext'
import { isEndTimeInPast, PAST_END_TIME_MESSAGE } from '../lib/validateSchedule'
import { ACTIVITY_CATEGORIES } from '../lib/categories'
import { FEE_LEVELS } from '../lib/feeLevel'
import { getClerkDisplayName } from '../lib/displayName'
import { applyParseResult } from '../lib/parseResult'
import { ImageUploadZone } from '../components/ImageUploadZone'

type InputMode = 'link' | 'image' | 'manual'

export function ProposePage() {
  const t = useT()
  const { user: clerkUser } = useUser()
  const [mode, setMode] = useState<InputMode>('link')
  const [url, setUrl] = useState('')
  const [parsing, setParsing] = useState(false)
  const [parseMessage, setParseMessage] = useState('')
  const [parseSuccess, setParseSuccess] = useState<boolean | null>(null)
  const [created, setCreated] = useState<Activity | null>(null)
  const [eventUrl, setEventUrl] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [dateHint, setDateHint] = useState('')
  const [dateEnd, setDateEnd] = useState('')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState<ActivityCategory>('other')
  const [feeLevel, setFeeLevel] = useState<FeeLevel>('unknown')
  const [feeDetail, setFeeDetail] = useState('')
  const [itinerary, setItinerary] = useState('')
  const [organizerName, setOrganizerName] = useState('')
  const [organizerContactType, setOrganizerContactType] = useState<OrganizerContactType>('private')
  const [organizerContact, setOrganizerContact] = useState('')
  const [organizerContactLabel, setOrganizerContactLabel] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [checkingSimilar, setCheckingSimilar] = useState(false)
  const [similarMatches, setSimilarMatches] = useState<SimilarProposalMatch[]>([])
  const [similarDialogOpen, setSimilarDialogOpen] = useState(false)

  useEffect(() => {
    if (!clerkUser) return
    setOrganizerName(getClerkDisplayName(clerkUser))
    api.getProfile()
      .then((p) => {
        if (p?.nickname?.trim()) setOrganizerName(p.nickname.trim())
        if (p?.wechat) {
          setOrganizerContactType('wechat')
          setOrganizerContact(p.wechat)
        } else if (p?.email) {
          setOrganizerContactType('email')
          setOrganizerContact(p.email)
        }
      })
      .catch(() => {})
  }, [clerkUser])

  const applyParsed = (data: Partial<ParseResult>) => {
    applyParseResult(data, {
      setTitle,
      setDescription,
      setLocation,
      setSourceUrl,
      setDateHint,
      setDateEnd,
      setCategory,
      setFeeLevel,
      setFee: setFeeDetail,
      setItinerary,
    }, { dateHintOnly: true })
  }

  const selectFeeLevel = (level: FeeLevel) => {
    setFeeLevel(level)
    if (level !== 'paid' && level !== 'low') setFeeDetail('')
  }

  const handleParseUrl = async () => {
    if (!url.trim()) return
    setParsing(true)
    setParseMessage('')
    try {
      const res = await api.parse({ url: url.trim() })
      setParseSuccess(res.success)
      setParseMessage(res.message ?? (res.success ? t.parseSuccessMsg : t.parseFailMsg))
      if (res.success) applyParsed({ ...res.data, sourceUrl: url.trim() })
    } catch {
      setParseSuccess(false)
      setParseMessage(t.parseErrorMsg)
    } finally {
      setParsing(false)
    }
  }

  const handleImageUpload = async (file: File) => {
    setParsing(true)
    setParseMessage('')
    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1]
      try {
        const res = await api.parse({ imageBase64: base64, mimeType: file.type })
        setParseSuccess(res.success)
        setParseMessage(res.message ?? (res.success ? t.parseSuccessMsg : t.parseFailMsg))
        if (res.success) applyParsed(res.data)
      } catch {
        setParseSuccess(false)
        setParseMessage(t.parseErrorMsg)
      } finally {
        setParsing(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const buildProposalPayload = () => ({
    title: title.trim(),
    description: description.trim(),
    date: dateHint ? null : null,
    location: location.trim(),
    sourceUrl: sourceUrl.trim(),
    category,
    feeLevel,
    organizerContactType,
    organizerContact: organizerContactType === 'private' ? '' : organizerContact.trim(),
    organizerContactLabel: organizerContactType === 'other' ? organizerContactLabel.trim() : undefined,
    organizerWechat: organizerContactType === 'wechat' ? organizerContact.trim() : '',
    fee: feeDetail.trim(),
    itinerary: itinerary.trim() || undefined,
    notes: dateHint ? `大概时间：${dateHint}` : '',
    dateEnd: dateEnd ? new Date(dateEnd).toISOString() : null,
  })

  const submitProposal = async () => {
    setSubmitting(true)
    try {
      const activity = await api.createProposal(buildProposalPayload())
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
    } catch (err) {
      alert(err instanceof Error ? err.message : t.error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('请填写活动/地点名称')
      return
    }
    if (isEndTimeInPast(dateEnd || undefined)) {
      alert(PAST_END_TIME_MESSAGE)
      return
    }

    setCheckingSimilar(true)
    try {
      const { matches } = await api.findSimilarProposals({
        title: title.trim(),
        location: location.trim() || undefined,
        sourceUrl: sourceUrl.trim() || undefined,
      })
      if (matches.length > 0) {
        setSimilarMatches(matches)
        setSimilarDialogOpen(true)
        return
      }
      await submitProposal()
    } catch (err) {
      alert(err instanceof Error ? err.message : '检查相似提议失败，请稍后重试')
    } finally {
      setCheckingSimilar(false)
    }
  }

  const handleConfirmSimilar = async () => {
    await submitProposal()
    setSimilarDialogOpen(false)
  }

  if (created) {
    const url = eventUrl || getEventUrl(created.id)
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 max-w-lg mx-auto px-4 py-16 text-center page-enter w-full">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-3">{t.proposeReceived}</h2>
          <p className="text-gray-500 mb-6">{t.proposeReceivedDesc}</p>
          <p className="text-sm text-gray-600 mb-2 break-all">{t.proposeLink}：{url}</p>
          <div className="flex gap-3 justify-center mb-4 flex-wrap">
            <button type="button" className="btn-primary" onClick={() => navigator.clipboard.writeText(url)}>
              {t.copyLink}
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-4">{t.proposeQR}</p>
          {qrDataUrl && (
            <div className="mb-8">
              <img src={qrDataUrl} alt="QR Code" className="mx-auto rounded-xl" />
            </div>
          )}
          <div className="flex gap-3 justify-center">
            <Link href="/" className="btn-primary">{t.backToHome}</Link>
            <Link href={`/event/${created.id}`} className="btn-secondary">{t.proposeLink}</Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col pb-24 sm:pb-32">
      <Header />
      <SignInGate>
      <main className="max-w-lg mx-auto px-4 py-4 sm:py-6 page-enter w-full">
        <h1 className="text-xl sm:text-2xl font-bold mb-1">{t.proposeTitle} 💡</h1>
        <p className="text-gray-500 text-xs sm:text-sm mb-4 sm:mb-6">{t.proposeSubtitle}</p>

        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
          {(['link', 'image', 'manual'] as InputMode[]).map((m) => (
            <button
              key={m}
              type="button"
              className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                mode === m ? 'bg-white shadow-sm text-green-700' : 'text-gray-500'
              }`}
              onClick={() => setMode(m)}
            >
              {m === 'link' ? t.parsePasteLink : m === 'image' ? t.parseUploadImage : t.parseManual}
            </button>
          ))}
        </div>

        {mode === 'link' && (
          <div className="mb-6">
            <div className="flex gap-2">
              <input
                className="input-field flex-1"
                placeholder={t.parsePlaceholder}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <button type="button" className="btn-primary shrink-0" onClick={handleParseUrl} disabled={parsing}>
                {parsing ? '...' : t.parseButton}
              </button>
            </div>
            <p className="text-xs text-amber-600 mt-2">{t.parseXiaohongshuHint}</p>
          </div>
        )}

        {mode === 'image' && (
          <div className="mb-6">
            <ImageUploadZone
              onFile={handleImageUpload}
              parsing={parsing}
              hint="图片/链接 AI 解析支持 Claude、OpenAI、Gemini，配置 API Key 并设置 PARSE_MODE"
            />
          </div>
        )}

        {parseMessage && (
          <div className={`text-sm mb-4 p-3 rounded-xl ${parseSuccess ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
            {parseSuccess ? '✅' : '⚠️'} {parseMessage}
          </div>
        )}

        <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">{t.fieldTitle} *</label>
            <input className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">{t.fieldDescription}</label>
            <textarea className="input-field min-h-[100px]" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">{t.fieldItinerary}</label>
            <textarea
              className="input-field min-h-[80px]"
              placeholder={t.fieldItineraryPlaceholder}
              value={itinerary}
              onChange={(e) => setItinerary(e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">{t.fieldItineraryHint}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">{t.fieldSourceUrl}</label>
            <input className="input-field" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">{t.fieldDateHintLabel}</label>
            <input className="input-field" placeholder={t.fieldDateHintPlaceholder} value={dateHint} onChange={(e) => setDateHint(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">{t.fieldExpiryLabel}</label>
            <input type="datetime-local" className="input-field" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} />
            <p className="text-xs text-gray-400 mt-1">{t.fieldExpiryHint}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">{t.fieldCategory}</label>
            <select className="input-field" value={category} onChange={(e) => setCategory(e.target.value as ActivityCategory)}>
              {ACTIVITY_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">{t.fieldMeetingLocation}</label>
            <input className="input-field" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">{t.fieldFee}</label>
            <div className="grid grid-cols-2 gap-2">
              {FEE_LEVELS.map((f) => (
                <label
                  key={f.value}
                  className={`flex items-start gap-2 p-3 rounded-xl border cursor-pointer transition-colors ${
                    feeLevel === f.value ? 'border-green-400 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="feeLevel"
                    value={f.value}
                    checked={feeLevel === f.value}
                    onChange={() => selectFeeLevel(f.value)}
                    className="sr-only"
                  />
                  <span className="mt-0.5">{f.emoji}</span>
                  <span className="text-sm min-w-0">
                    <span className="block">{f.label}</span>
                    {feeLevel === f.value && feeDetail && (f.value === 'paid' || f.value === 'free' || f.value === 'low') && (
                      <span className="block text-xs text-green-700 mt-1 font-normal break-words">
                        {feeDetail}
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </div>
            {feeLevel === 'paid' && (
              <div className="mt-3">
                <label className="text-xs text-gray-500 mb-1 block">{t.proposeFeeDetailLabel}</label>
                <input
                  className="input-field text-sm"
                  placeholder={t.fieldFeeDetailPlaceholder}
                  value={feeDetail}
                  onChange={(e) => setFeeDetail(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6 mb-8">
          <h3 className="font-medium mb-3">{t.contactLabel}</h3>
          <p className="text-sm text-gray-500 mb-3">
            {t.proposeSubmitAs(organizerName || getClerkDisplayName(clerkUser))}
          </p>
          <OrganizerContactFields
            contactType={organizerContactType}
            contact={organizerContact}
            contactLabel={organizerContactLabel}
            onTypeChange={setOrganizerContactType}
            onContactChange={setOrganizerContact}
            onLabelChange={setOrganizerContactLabel}
          />
        </div>

        <button
          type="button"
          className="btn-primary w-full text-lg"
          onClick={handleSubmit}
          disabled={submitting || checkingSimilar}
        >
          {checkingSimilar ? t.proposeCheckingSimilar : submitting ? t.proposeSubmitting : t.proposeSubmitButton}
        </button>
      </main>
      </SignInGate>
      <SimilarProposalsDialog
        open={similarDialogOpen}
        matches={similarMatches}
        onConfirm={handleConfirmSimilar}
        onCancel={() => setSimilarDialogOpen(false)}
        confirming={submitting}
      />
      <Footer />
    </div>
  )
}
