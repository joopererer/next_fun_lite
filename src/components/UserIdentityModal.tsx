'use client'

import { useState } from 'react'
import { getUser, saveUser, type UserIdentity } from '../lib/user'
import { ModalSheet } from './ui/ModalSheet'

interface Props {
  open: boolean
  onClose: () => void
  onSave?: (user: UserIdentity) => void
}

export function UserIdentityModal({ open, onClose, onSave }: Props) {
  const existing = getUser()
  const [name, setName] = useState(existing?.name ?? '')
  const [wechat, setWechat] = useState(existing?.wechat ?? '')

  const handleSave = () => {
    if (!name.trim() || !wechat.trim()) return
    const user = { name: name.trim(), wechat: wechat.trim() }
    saveUser(user)
    onSave?.(user)
    onClose()
  }

  return (
    <ModalSheet
      open={open}
      onClose={onClose}
      title="欢迎来到快乐制造局 👋"
      footer={
        <div className="flex gap-2 sm:gap-3">
          <button type="button" className="btn-secondary flex-1" onClick={onClose}>取消</button>
          <button type="button" className="btn-primary flex-1" onClick={handleSave}>保存</button>
        </div>
      }
    >
      <p className="text-gray-500 text-xs sm:text-sm mb-3">你叫什么？（仅用于报名和提议，不会公开）</p>
      <div className="space-y-2.5 sm:space-y-3">
        <div>
          <label className="text-xs sm:text-sm text-gray-600 mb-1 block">昵称</label>
          <input
            className="input-field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="你的昵称"
          />
        </div>
        <div>
          <label className="text-xs sm:text-sm text-gray-600 mb-1 block">微信号</label>
          <input
            className="input-field"
            value={wechat}
            onChange={(e) => setWechat(e.target.value)}
            placeholder="你的微信号"
          />
        </div>
      </div>
    </ModalSheet>
  )
}
