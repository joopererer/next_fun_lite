'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { api } from '../lib/api'
import { getClerkDisplayName } from '../lib/displayName'
import { ModalSheet } from './ui/ModalSheet'

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
      alert(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  return createPortal(
    <ModalSheet
      open={open}
      onClose={onClose}
      zIndexClass="z-[9999]"
      title={mode === 'setup' ? '完善资料（可选）' : '编辑资料'}
      footer={
        <div className="flex gap-2 sm:gap-3">
          <button type="button" className="btn-secondary flex-1" onClick={onClose}>
            {mode === 'setup' ? '跳过' : '取消'}
          </button>
          <button type="button" className="btn-primary flex-1" onClick={handleSave} disabled={saving}>
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      }
    >
      <p className="text-gray-500 text-xs sm:text-sm mb-3">
        {mode === 'setup'
          ? '设置昵称和微信号，方便活动组织者联系你。可稍后在头像菜单修改。'
          : '修改后将用于之后的报名与提议。'}
      </p>
      <div className="space-y-2.5 sm:space-y-3">
        <div>
          <label className="text-xs sm:text-sm text-gray-600 mb-1 block">昵称</label>
          <input
            className="input-field"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder={getClerkDisplayName(user) || '你的昵称'}
          />
          <p className="text-xs text-gray-400 mt-1">留空则使用登录账号名</p>
        </div>
        <div>
          <label className="text-xs sm:text-sm text-gray-600 mb-1 block">微信号（可选）</label>
          <input
            className="input-field"
            value={wechat}
            onChange={(e) => setWechat(e.target.value)}
            placeholder="方便组织者联系"
          />
        </div>
      </div>
    </ModalSheet>,
    document.body,
  )
}
