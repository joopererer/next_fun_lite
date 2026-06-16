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
import { useT } from '../i18n/LanguageContext'

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
  const t = useT()
  const [loading, setLoading] = useState(true)
  const [forbidden, setForbidden] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

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
      alert(t.fieldTitle + ' ' + t.error)
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
      alert(err instanceof Error ? err.message : t.error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!id) return
    setDeleting(true)
    try {
      await api.deleteActivity(id)
      router.push('/')
    } catch (err) {
      alert(err instanceof Error ? err.message : t.error)
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col pb-32">
      <Header />
      <SignInGate>
        {loading ? (
          <div className="text-center text-gray-400 py-16">{t.loading}</div>
        ) : forbidden ? (
          <main className="max-w-lg mx-auto px-4 py-16 text-center">
            <p className="text-gray-600 mb-4">{t.editForbiddenProposal}</p>
            <Link href={id ? `/event/${id}` : '/'} className="btn-primary">{t.backToProposalPage}</Link>
          </main>
        ) : (
          <main className="max-w-lg mx-auto px-4 py-6 page-enter w-full">
            <Link href={`/event/${id}`} className="text-sm text-gray-400 hover:text-green-600 mb-4 inline-block">
              {t.backToProposalPage}
            </Link>
            <h1 className="text-2xl font-bold mb-6">{t.editProposalTitle}</h1>
            <div className="space-y-4 mb-8">
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
                <textarea className="input-field min-h-[80px]" value={itinerary} onChange={(e) => setItinerary(e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">{t.fieldSourceUrl}</label>
                <input className="input-field" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">{t.fieldDateHintLabel}</label>
                <input className="input-field" value={dateHint} onChange={(e) => setDateHint(e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">{t.fieldExpiryLabel}</label>
                <input type="datetime-local" className="input-field" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} />
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
                    placeholder={t.fieldFeeDetail}
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
              {submitting ? t.saving : t.save}
            </button>
            <button
              type="button"
              className="w-full mt-3 py-2.5 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
              onClick={() => setConfirmDelete(true)}
              disabled={submitting || deleting}
            >
              {t.delete}
            </button>
          </main>
        )}
      </SignInGate>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-semibold text-lg mb-2">{t.deleteProposalConfirmTitle}</h3>
            <p className="text-sm text-gray-500 mb-6">{t.deleteProposalConfirmBody}</p>
            <div className="flex gap-3">
              <button
                type="button"
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
              >
                {t.cancel}
              </button>
              <button
                type="button"
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-60"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? t.deleting : t.delete}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
