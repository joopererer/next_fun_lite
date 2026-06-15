'use client'

import { useEffect, useState } from 'react'
import type { Profile, Registration, RegistrantContactType } from '../../../shared/types'
import { RegistrantContactFields } from '../contact/RegistrantContactFields'
import { ModalSheet } from '../ui/ModalSheet'
import { formatRegistrationContactLine } from '../../lib/contact'
import { api } from '../../lib/api'
import { notifyActivitiesChanged } from '../../lib/activityEvents'
import { useT } from '../../i18n/LanguageContext'

interface Props {
  activityId: string
  registrations: Registration[]
  onMutated: () => void
  onExport: () => void
}

type FormMode = { kind: 'add' } | { kind: 'edit'; registration: Registration }

function emptyForm() {
  return {
    name: '',
    contactType: 'wechat' as RegistrantContactType,
    contactValue: '',
    contactLabel: '',
    participantCount: 1,
    note: '',
  }
}

function profileContact(profile: Profile): { contactType: RegistrantContactType; contactValue: string } {
  if (profile.wechat) return { contactType: 'wechat', contactValue: profile.wechat }
  if (profile.email) return { contactType: 'email', contactValue: profile.email }
  return { contactType: 'wechat', contactValue: '' }
}

export function AdminRegistrationManager({ activityId, registrations, onMutated, onExport }: Props) {
  const t = useT()
  const active = registrations.filter((r) => !r.cancelledAt)
  const [formMode, setFormMode] = useState<FormMode | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [linkedUserId, setLinkedUserId] = useState<string | null>(null)
  const [linkedLabel, setLinkedLabel] = useState('')
  const [profileQuery, setProfileQuery] = useState('')
  const [profileResults, setProfileResults] = useState<Profile[]>([])
  const [profileSearching, setProfileSearching] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Registration | null>(null)

  useEffect(() => {
    const q = profileQuery.trim()
    if (q.length < 2) {
      setProfileResults([])
      return
    }
    const timer = setTimeout(() => {
      setProfileSearching(true)
      api.adminSearchProfiles(q)
        .then(({ profiles }) => setProfileResults(profiles))
        .catch(() => setProfileResults([]))
        .finally(() => setProfileSearching(false))
    }, 300)
    return () => clearTimeout(timer)
  }, [profileQuery])

  const resetLinkState = () => {
    setLinkedUserId(null)
    setLinkedLabel('')
    setProfileQuery('')
    setProfileResults([])
  }

  const openAdd = () => {
    setForm(emptyForm())
    resetLinkState()
    setFormMode({ kind: 'add' })
  }

  const openEdit = (registration: Registration) => {
    setForm({
      name: registration.name,
      contactType: registration.contactType ?? 'wechat',
      contactValue: registration.contactValue ?? registration.wechat ?? '',
      contactLabel: registration.contactLabel ?? '',
      participantCount: registration.participantCount,
      note: registration.note ?? '',
    })
    setLinkedUserId(registration.userId ?? null)
    setLinkedLabel(registration.userId ? '平台用户' : '')
    setProfileQuery('')
    setProfileResults([])
    setFormMode({ kind: 'edit', registration })
  }

  const closeForm = () => {
    if (saving) return
    setFormMode(null)
  }

  const selectProfile = (profile: Profile) => {
    const { contactType, contactValue } = profileContact(profile)
    setLinkedUserId(profile.id)
    setLinkedLabel(profile.nickname)
    setProfileQuery('')
    setProfileResults([])
    setForm((f) => ({
      ...f,
      name: profile.nickname,
      contactType,
      contactValue: contactValue || f.contactValue,
    }))
  }

  const clearLink = () => {
    setLinkedUserId(null)
    setLinkedLabel('')
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.contactValue.trim()) {
      alert('请填写姓名和联系方式')
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        contactType: form.contactType,
        contactValue: form.contactValue.trim(),
        contactLabel: form.contactLabel.trim() || undefined,
        participantCount: form.participantCount,
        note: form.note.trim(),
      }
      if (formMode?.kind === 'add') {
        await api.adminCreateRegistration({
          activityId,
          ...payload,
          userId: linkedUserId ?? undefined,
        })
      } else if (formMode?.kind === 'edit') {
        await api.adminUpdateRegistration(formMode.registration.id, {
          ...payload,
          userId: linkedUserId,
        })
      }
      notifyActivitiesChanged()
      setFormMode(null)
      onMutated()
    } catch (err) {
      alert(err instanceof Error ? err.message : t.error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    setDeletingId(confirmDelete.id)
    try {
      await api.cancelRegistrationById(confirmDelete.id)
      notifyActivitiesChanged()
      setConfirmDelete(null)
      onMutated()
    } catch (err) {
      alert(err instanceof Error ? err.message : t.error)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">{t.adminRegistrationList}</h2>
        <div className="flex gap-2">
          <button type="button" className="btn-primary text-sm" onClick={openAdd}>
            {t.adminAddRegistration}
          </button>
          <button type="button" className="btn-secondary text-sm" onClick={onExport}>
            {t.adminExportList}
          </button>
        </div>
      </div>

      {active.length === 0 ? (
        <p className="text-gray-400 text-sm">{t.adminNoRegistrations}</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="py-2 pr-3">{t.nameLabel}</th>
                  <th className="py-2 pr-3">{t.contactLabel}</th>
                  <th className="py-2 pr-3">{t.participantCount}</th>
                  <th className="py-2 pr-3">{t.noteLabel}</th>
                  <th className="py-2 pr-3">{t.eventDate}</th>
                  <th className="py-2 w-24"></th>
                </tr>
              </thead>
              <tbody>
                {active.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50">
                    <td className="py-2.5 pr-3">
                      {r.name}
                      {r.userId && (
                        <span className="ml-1.5 text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                          {t.adminLinkedUser}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 pr-3">{formatRegistrationContactLine(r)}</td>
                    <td className="py-2.5 pr-3">{r.participantCount}</td>
                    <td className="py-2.5 pr-3">{r.note || '-'}</td>
                    <td className="py-2.5 pr-3 text-gray-400">
                      {new Date(r.registeredAt).toLocaleString()}
                    </td>
                    <td className="py-2.5">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="text-green-600 hover:underline"
                          onClick={() => openEdit(r)}
                        >
                          {t.edit}
                        </button>
                        <button
                          type="button"
                          className="text-red-500 hover:underline disabled:opacity-50"
                          disabled={deletingId === r.id}
                          onClick={() => setConfirmDelete(r)}
                        >
                          {t.delete}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            {t.adminTotalSummary(active.length, active.reduce((s, r) => s + r.participantCount, 0))}
          </p>
        </>
      )}

      <ModalSheet
        open={formMode !== null}
        onClose={closeForm}
        title={formMode?.kind === 'edit' ? `${t.edit}${t.adminRegistrationList}` : t.adminAddRegistration}
        footer={
          <div className="flex gap-2">
            <button type="button" className="btn-secondary flex-1" onClick={closeForm} disabled={saving}>
              {t.cancel}
            </button>
            <button type="button" className="btn-primary flex-1" onClick={handleSave} disabled={saving}>
              {saving ? t.saving : t.save}
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-3 space-y-2">
            <label className="text-xs sm:text-sm text-gray-600 block">
              {t.adminSearchUser} ({t.optional})
            </label>
            {linkedUserId ? (
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="text-green-700">
                  {t.adminUserLinked(linkedLabel || '—')}
                </span>
                <button type="button" className="text-gray-500 hover:text-red-500 shrink-0" onClick={clearLink}>
                  {t.adminUnlinkUser}
                </button>
              </div>
            ) : (
              <>
                <input
                  className="input-field text-sm"
                  value={profileQuery}
                  onChange={(e) => setProfileQuery(e.target.value)}
                  placeholder={t.adminSearchPlaceholder}
                />
                {profileSearching && (
                  <p className="text-xs text-gray-400">{t.adminSearchSearching}</p>
                )}
                {profileResults.length > 0 && (
                  <ul className="border border-gray-200 rounded-xl bg-white overflow-hidden divide-y divide-gray-100">
                    {profileResults.map((profile) => (
                      <li key={profile.id}>
                        <button
                          type="button"
                          className="w-full text-left px-3 py-2.5 text-sm hover:bg-green-50"
                          onClick={() => selectProfile(profile)}
                        >
                          <span className="font-medium">{profile.nickname}</span>
                          {profile.wechat && (
                            <span className="text-gray-500 ml-2">{profile.wechat}</span>
                          )}
                          {!profile.wechat && profile.email && (
                            <span className="text-gray-500 ml-2">{profile.email}</span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {profileQuery.trim().length >= 2 && !profileSearching && profileResults.length === 0 && (
                  <p className="text-xs text-gray-400">{t.adminSearchNoResult}</p>
                )}
              </>
            )}
            <p className="text-xs text-gray-400">{t.adminLinkHint}</p>
          </div>

          <div>
            <label className="text-xs sm:text-sm text-gray-600 mb-1.5 block">{t.nameLabel}</label>
            <input
              className="input-field"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder={t.namePlaceholder}
            />
          </div>
          <RegistrantContactFields
            contactType={form.contactType}
            contactValue={form.contactValue}
            contactLabel={form.contactLabel}
            onTypeChange={(contactType) => setForm((f) => ({ ...f, contactType }))}
            onValueChange={(contactValue) => setForm((f) => ({ ...f, contactValue }))}
            onLabelChange={(contactLabel) => setForm((f) => ({ ...f, contactLabel }))}
          />
          <div>
            <label className="text-xs sm:text-sm text-gray-600 mb-1.5 block">{t.participantCount}</label>
            <input
              className="input-field"
              type="number"
              min={1}
              value={form.participantCount}
              onChange={(e) =>
                setForm((f) => ({ ...f, participantCount: Math.max(1, Number(e.target.value) || 1) }))
              }
            />
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 mb-1.5 block">{t.noteLabel}</label>
            <textarea
              className="input-field min-h-[72px]"
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              placeholder={t.optional}
            />
          </div>
        </div>
      </ModalSheet>

      <ModalSheet
        open={confirmDelete !== null}
        onClose={() => !deletingId && setConfirmDelete(null)}
        title={t.adminConfirmDeleteTitle}
        footer={
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-secondary flex-1"
              onClick={() => setConfirmDelete(null)}
              disabled={!!deletingId}
            >
              {t.cancel}
            </button>
            <button
              type="button"
              className="btn-primary flex-1 bg-red-500 hover:bg-red-600 border-red-500"
              onClick={handleDelete}
              disabled={!!deletingId}
            >
              {deletingId ? t.processing : t.confirm}
            </button>
          </div>
        }
      >
        <p className="text-sm text-gray-600">
          {confirmDelete ? t.adminConfirmDeleteBody(confirmDelete.name) : ''}
        </p>
      </ModalSheet>
    </>
  )
}
