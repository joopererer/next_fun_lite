'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import type { Activity, ActivityCategory, ActivityWithCount, FeeLevel, OrganizerContactType } from '../../shared/types'
import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'
import { SignInGate } from '../components/SignInGate'
import { OrganizerContactFields } from '../components/contact/OrganizerContactFields'
import { api } from '../lib/api'
import { ACTIVITY_CATEGORIES } from '../lib/categories'
import { FEE_LEVELS } from '../lib/feeLevel'
import { canOrganizerEditActivity } from '../lib/organizerEdit'
import { isProposalPost } from '../lib/infoVisibility'
import { isEndTimeInPast, PAST_END_TIME_MESSAGE } from '../lib/validateSchedule'

function toDatetimeLocal(iso?: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function extractDateHint(notes?: string): string {
  if (!notes?.startsWith('大概时间：')) return ''
  return notes.slice('大概时间：'.length)
}

export function ProposeEditPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user, isLoaded, isSignedIn } = useUser()
  const [loading, setLoading] = useState(true)
  const [forbidden, setForbidden] = useState(false)
  const [submitting, setSubmitting] = useState(false)

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
  const [organizerContactType, setOrganizerContactType] = useState<OrganizerContactType>('private')
  const [organizerContact, setOrganizerContact] = useState('')
  const [organizerContactLabel, setOrganizerContactLabel] = useState('')

  useEffect(() => {
    if (!id || !isLoaded) return
    if (!isSignedIn) {
      setLoading(false)
      return
    }
    api.getActivity(id)
      .then((a: ActivityWithCount) => {
        if (!isProposalPost(a) || !canOrganizerEditActivity(a, user?.id)) {
          setForbidden(true)
          return
        }
        setTitle(a.title)
        setDescription(a.description)
        setSourceUrl(a.sourceUrl)
        setDateHint(extractDateHint(a.notes))
        setDateEnd(toDatetimeLocal(a.dateEnd))
        setLocation(a.location)
        setCategory(a.category)
        setFeeLevel(a.feeLevel ?? 'unknown')
        setFeeDetail(a.fee ?? '')
        setItinerary(a.itinerary ?? '')
        setOrganizerContactType(a.organizerContactType ?? 'private')
        setOrganizerContact(a.organizerContact ?? a.organizerWechat ?? '')
        setOrganizerContactLabel(a.organizerContactLabel ?? '')
      })
      .catch(() => setForbidden(true))
      .finally(() => setLoading(false))
  }, [id, isLoaded, isSignedIn, user?.id])

  const handleSubmit = async () => {
    if (!id || !title.trim()) {
      alert('请填写活动/地点名称')
      return
    }
    if (isEndTimeInPast(dateEnd || undefined)) {
      alert(PAST_END_TIME_MESSAGE)
      return
    }
    setSubmitting(true)
    try {
      await api.updateActivity(id, {
        title: title.trim(),
        description: description.trim(),
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
      router.push(`/event/${id}`)
    } catch (err) {
      alert(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col pb-32">
      <Header />
      <SignInGate message="登录后即可编辑提议">
        {loading ? (
          <div className="text-center text-gray-400 py-16">加载中...</div>
        ) : forbidden ? (
          <main className="max-w-lg mx-auto px-4 py-16 text-center">
            <p className="text-gray-600 mb-4">无法编辑此提议</p>
            <Link href={id ? `/event/${id}` : '/'} className="btn-primary">返回提议页</Link>
          </main>
        ) : (
          <main className="max-w-lg mx-auto px-4 py-6 page-enter w-full">
            <Link href={`/event/${id}`} className="text-sm text-gray-400 hover:text-green-600 mb-4 inline-block">
              ← 返回提议页
            </Link>
            <h1 className="text-2xl font-bold mb-6">编辑提议</h1>
            <div className="space-y-4 mb-8">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">活动/地点名称 *</label>
                <input className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">简介</label>
                <textarea className="input-field min-h-[100px]" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">行程（选填）</label>
                <textarea className="input-field min-h-[80px]" value={itinerary} onChange={(e) => setItinerary(e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">参考链接</label>
                <input className="input-field" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">大概时间（选填）</label>
                <input className="input-field" value={dateHint} onChange={(e) => setDateHint(e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">信息有效期至（选填）</label>
                <input type="datetime-local" className="input-field" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} />
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
                <label className="text-sm text-gray-600 mb-1 block">大概地点（选填）</label>
                <input className="input-field" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">费用水平</label>
                <div className="grid grid-cols-2 gap-2">
                  {FEE_LEVELS.map((f) => (
                    <label
                      key={f.value}
                      className={`flex items-start gap-2 p-3 rounded-xl border cursor-pointer ${
                        feeLevel === f.value ? 'border-green-400 bg-green-50' : 'border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="feeLevel"
                        value={f.value}
                        checked={feeLevel === f.value}
                        onChange={() => setFeeLevel(f.value)}
                        className="sr-only"
                      />
                      <span>{f.emoji}</span>
                      <span className="text-sm">{f.label}</span>
                    </label>
                  ))}
                </div>
                {feeLevel === 'paid' && (
                  <input
                    className="input-field text-sm mt-3"
                    placeholder="费用说明"
                    value={feeDetail}
                    onChange={(e) => setFeeDetail(e.target.value)}
                  />
                )}
              </div>
            </div>
            <OrganizerContactFields
              contactType={organizerContactType}
              contact={organizerContact}
              contactLabel={organizerContactLabel}
              onTypeChange={setOrganizerContactType}
              onContactChange={setOrganizerContact}
              onLabelChange={setOrganizerContactLabel}
            />
            <button type="button" className="btn-primary w-full text-lg mt-6" onClick={handleSubmit} disabled={submitting}>
              {submitting ? '保存中...' : '保存修改'}
            </button>
          </main>
        )}
      </SignInGate>
      <Footer />
    </div>
  )
}
