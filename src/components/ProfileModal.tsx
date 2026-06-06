'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { getClerkDisplayName } from '../lib/displayName'

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

  useEffect(() => {
    if (!open) return
    setNickname(initialNickname ?? getClerkDisplayName(user))
    setWechat(initialWechat ?? '')
  }, [open, initialNickname, initialWechat, user])

  if (!open) return null

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

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl page-enter">
        <h2 className="text-xl font-bold mb-1">
          {mode === 'setup' ? '完善资料（可选）' : '编辑资料'}
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          {mode === 'setup'
            ? '设置昵称和微信号，方便活动组织者联系你。可跳过，之后可在头像菜单修改。'
            : '微信号仅活动发起人和管理员可见，不会在公开页面显示。'}
        </p>

        <div className="space-y-4 mb-6">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">昵称</label>
            <input
              className="input-field"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={getClerkDisplayName(user) || '你的昵称'}
            />
            <p className="text-xs text-gray-400 mt-1">留空则使用登录账号名</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">微信号（可选）</label>
            <input
              className="input-field"
              value={wechat}
              onChange={(e) => setWechat(e.target.value)}
              placeholder="方便组织者联系"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button type="button" className="btn-primary w-full" onClick={handleSave} disabled={saving}>
            {saving ? '保存中...' : '保存'}
          </button>
          {mode === 'setup' && (
            <button type="button" className="btn-secondary w-full" onClick={onClose}>
              跳过
            </button>
          )}
          {mode === 'edit' && (
            <button type="button" className="text-sm text-gray-500 py-2" onClick={onClose}>
              取消
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
