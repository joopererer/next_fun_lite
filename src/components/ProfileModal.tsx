'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { api } from '../lib/api'
import { getClerkDisplayName } from '../lib/displayName'
import { ModalSheet } from './ui/ModalSheet'
import { useT } from '../i18n/LanguageContext'

interface Props {
  open: boolean
  mode: 'setup' | 'edit'
  initialNickname?: string
  initialWechat?: string
  onClose: () => void
  onSaved?: () => void
}

export function ProfileModal({
  open,
  mode,
  initialNickname,
  initialWechat,
  onClose,
  onSaved,
}: Props) {
  const { user } = useUser()
  const t = useT()
  const [nickname, setNickname] = useState('')
  const [wechat, setWechat] = useState('')
  const [saving, setSaving] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return
    setNickname(initialNickname ?? getClerkDisplayName(user))
    setWechat(initialWechat ?? '')
  }, [open, initialNickname, initialWechat, user])

  if (!open || !mounted) return null

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.saveProfile({
        nickname: nickname.trim() || getClerkDisplayName(user),
        wechat: wechat.trim(),
      })
      onSaved?.()
      onClose()
    } catch (err) {
      alert(err instanceof Error ? err.message : t.error)
    } finally {
      setSaving(false)
    }
  }

  return createPortal(
    <ModalSheet
      open={open}
      onClose={onClose}
      zIndexClass="z-[9999]"
      title={mode === 'setup' ? t.profileSetupTitle : t.profileEditTitle}
      footer={
        <div className="flex gap-2 sm:gap-3">
          <button type="button" className="btn-secondary flex-1" onClick={onClose}>
            {mode === 'setup' ? t.skip : t.cancel}
          </button>
          <button type="button" className="btn-primary flex-1" onClick={handleSave} disabled={saving}>
            {saving ? t.saving : t.save}
          </button>
        </div>
      }
    >
      <p className="text-gray-500 text-xs sm:text-sm mb-3">
        {mode === 'setup' ? t.profileSetupDesc : t.profileEditDesc}
      </p>
      <div className="space-y-2.5 sm:space-y-3">
        <div>
          <label className="text-xs sm:text-sm text-gray-600 mb-1 block">{t.nicknameLabel}</label>
          <input
            className="input-field"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder={t.nicknamePlaceholder(getClerkDisplayName(user))}
          />
          <p className="text-xs text-gray-400 mt-1">{t.nicknameHint}</p>
        </div>
        <div>
          <label className="text-xs sm:text-sm text-gray-600 mb-1 block">{t.wechatLabel}</label>
          <input
            className="input-field"
            value={wechat}
            onChange={(e) => setWechat(e.target.value)}
            placeholder={t.wechatModalPlaceholder}
          />
        </div>
      </div>
    </ModalSheet>,
    document.body,
  )
}
