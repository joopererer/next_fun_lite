'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import type { Activity, ActivityCategory } from '../../../shared/types'
import { DEFAULT_INFO_ACTION_LABEL } from '../../../shared/infoDefaults'
import { api } from '../../lib/api'
import { ACTIVITY_CATEGORIES } from '../../lib/categories'
import { getClerkDisplayName } from '../../lib/displayName'
import { isEndTimeInPast, PAST_END_TIME_MESSAGE } from '../../lib/validateSchedule'
import { useT } from '../../i18n/LanguageContext'

function toDatetimeLocal(iso?: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fromDatetimeLocal(value: string): string | undefined {
  if (!value) return undefined
  return new Date(value).toISOString()
}

export interface InfoFormProps {
  mode: 'create' | 'edit'
  initial?: Partial<Activity>
  editId?: string
  onSuccess?: (activity: Activity) => void
  submitLabel?: string
}

export function InfoForm({ mode, initial, editId, onSuccess, submitLabel }: InfoFormProps) {
  const { user, isSignedIn, isLoaded } = useUser()
  const t = useT()
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [category, setCategory] = useState<ActivityCategory>(initial?.category ?? 'culture')
  const [sourceUrl, setSourceUrl] = useState(initial?.sourceUrl ?? '')
  const [infoStartTime, setInfoStartTime] = useState(toDatetimeLocal(initial?.infoStartTime))
  const [infoDeadline, setInfoDeadline] = useState(toDatetimeLocal(initial?.infoDeadline))
  const [infoPrice, setInfoPrice] = useState(initial?.infoPrice ?? '')
  const [infoActionLabel, setInfoActionLabel] = useState(initial?.infoActionLabel ?? '')
  const [infoActionUrl, setInfoActionUrl] = useState(initial?.infoActionUrl ?? '')
  const [organizerName, setOrganizerName] = useState(initial?.organizerName ?? '')
  const [nameTouched, setNameTouched] = useState(Boolean(initial?.organizerName))
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (mode === 'edit' || !isLoaded || nameTouched || !isSignedIn) return
    const clerkName = getClerkDisplayName(user)
    api.getProfile()
      .then((p) => {
        setOrganizerName(p?.nickname?.trim() || clerkName)
      })
      .catch(() => {
        setOrganizerName(clerkName)
      })
  }, [mode, isLoaded, isSignedIn, user, nameTouched])

  const buildPayload = (): Partial<Activity> => ({
    title: title.trim(),
    description: description.trim(),
    category,
    sourceUrl: sourceUrl.trim(),
    organizerName: organizerName.trim(),
    infoStartTime: fromDatetimeLocal(infoStartTime),
    infoDeadline: fromDatetimeLocal(infoDeadline),
    infoPrice: infoPrice.trim() || undefined,
    infoActionLabel: infoActionLabel.trim() || DEFAULT_INFO_ACTION_LABEL,
    infoActionUrl: infoActionUrl.trim() || undefined,
  })

  const validate = (): boolean => {
    if (!title.trim()) {
      alert(t.fieldTitle + ' ' + t.error)
      return false
    }
    if (!organizerName.trim()) {
      alert(t.infoFieldOrganizerName + ' ' + t.error)
      return false
    }
    if (isEndTimeInPast(infoDeadline || undefined)) {
      alert(PAST_END_TIME_MESSAGE)
      return false
    }
    if (infoStartTime && infoDeadline) {
      const start = new Date(infoStartTime).getTime()
      const end = new Date(infoDeadline).getTime()
      if (!Number.isNaN(start) && !Number.isNaN(end) && start >= end) {
        alert(t.infoStartDateMustBeBeforeDeadline)
        return false
      }
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitting(true)
    try {
      const payload = buildPayload()
      const activity = mode === 'edit' && editId
        ? await api.updateActivity(editId, payload)
        : await api.createInfo(payload)
      onSuccess?.(activity)
    } catch (err) {
      alert(err instanceof Error ? err.message : t.error)
    } finally {
      setSubmitting(false)
    }
  }

  const defaultSubmitLabel = mode === 'edit' ? t.save : t.infoPublishButton

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm text-gray-600 mb-1 block">{t.fieldTitle} *</label>
        <input className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <label className="text-sm text-gray-600 mb-1 block">{t.infoFieldDescription}</label>
        <textarea className="input-field min-h-[100px]" value={description} onChange={(e) => setDescription(e.target.value)} />
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
        <label className="text-sm text-gray-600 mb-1 block">{t.fieldSourceUrl}</label>
        <input className="input-field" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} />
      </div>
      <div>
        <label className="text-sm text-gray-600 mb-1 block">{t.infoFieldStartTime}</label>
        <input type="datetime-local" className="input-field" value={infoStartTime} onChange={(e) => setInfoStartTime(e.target.value)} />
        <p className="text-xs text-gray-400 mt-1">{t.infoFieldStartTimeHint}</p>
      </div>
      <div>
        <label className="text-sm text-gray-600 mb-1 block">{t.infoFieldDeadline}</label>
        <input type="datetime-local" className="input-field" value={infoDeadline} onChange={(e) => setInfoDeadline(e.target.value)} />
        <p className="text-xs text-gray-400 mt-1">{t.infoFieldDeadlineHint}</p>
      </div>
      <div>
        <label className="text-sm text-gray-600 mb-1 block">{t.infoFieldPrice}</label>
        <input className="input-field" value={infoPrice} onChange={(e) => setInfoPrice(e.target.value)} placeholder={t.infoFieldPricePlaceholder} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-gray-600 mb-1 block">{t.infoFieldActionLabel}</label>
          <input
            className="input-field"
            value={infoActionLabel}
            onChange={(e) => setInfoActionLabel(e.target.value)}
            placeholder={DEFAULT_INFO_ACTION_LABEL}
          />
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">{t.infoFieldActionUrl}</label>
          <input className="input-field" value={infoActionUrl} onChange={(e) => setInfoActionUrl(e.target.value)} placeholder="https://..." />
        </div>
      </div>
      <div>
        <label className="text-sm text-gray-600 mb-1 block">{t.infoFieldOrganizerName}</label>
        {isSignedIn && (
          <p className="text-xs text-gray-400 mb-1">{t.infoAutoFilledName}</p>
        )}
        <input
          className="input-field"
          value={organizerName}
          onChange={(e) => {
            setNameTouched(true)
            setOrganizerName(e.target.value)
          }}
        />
      </div>
      <button type="button" className="btn-primary w-full text-lg" onClick={handleSubmit} disabled={submitting}>
        {submitting ? t.saving : (submitLabel ?? defaultSubmitLabel)}
      </button>
    </div>
  )
}
