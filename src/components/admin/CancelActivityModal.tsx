'use client'

import { useState } from 'react'
import type { ActivityWithCount, CancelReason } from '../../../shared/types'
import { getCancelReasonLabel } from '../../lib/activityStatus'
import { api } from '../../lib/api'

const REASONS: { value: CancelReason; label: string; emoji: string }[] = [
  { value: 'weather', label: '天气原因', emoji: '🌧' },
  { value: 'insufficient_participants', label: '报名人数不足', emoji: '👥' },
  { value: 'venue', label: '场地/时间问题', emoji: '🏛' },
  { value: 'other', label: '其他', emoji: '✏️' },
]

interface Props {
  activity: ActivityWithCount
  open: boolean
  onClose: () => void
  onSaved?: () => void
}

export function CancelActivityModal({ activity, open, onClose, onSaved }: Props) {
  const [reason, setReason] = useState<CancelReason>('weather')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  if (!open) return null

  const handleConfirm = async () => {
    setSaving(true)
    try {
      await api.updateActivity(activity.id, {
        status: 'ended_cancelled',
        cancelReason: reason,
        cancelNote: note.trim(),
        endedAt: new Date().toISOString(),
      })
      onClose()
      onSaved?.()
    } catch (err) {
      alert(err instanceof Error ? err.message : '取消失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
        <h3 className="font-bold text-lg mb-4 text-red-700">❌ 确认取消活动？</h3>
        <p className="text-sm text-gray-600 mb-1">活动名称：{activity.title}</p>
        <p className="text-sm text-gray-600 mb-4">当前已有 {activity.registeredCount} 人报名</p>

        <p className="text-sm text-gray-600 mb-2">取消原因 *</p>
        <div className="space-y-2 mb-4">
          {REASONS.map((r) => (
            <label key={r.value} className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="radio"
                name="cancelReason"
                value={r.value}
                checked={reason === r.value}
                onChange={() => setReason(r.value)}
              />
              <span>{r.emoji} {r.label}</span>
            </label>
          ))}
        </div>

        <div className="mb-4">
          <label className="text-sm text-gray-600 mb-1 block">补充说明（选填）</label>
          <textarea
            className="input-field min-h-[80px]"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={getCancelReasonLabel(reason)}
          />
        </div>

        <p className="text-xs text-amber-700 bg-amber-50 rounded-lg p-3 mb-4">
          ⚠️ 取消后活动页面会显示取消提示，报名名单仍然保留，请手动通知已报名的成员。
        </p>

        <div className="flex gap-3">
          <button type="button" className="btn-secondary flex-1" onClick={onClose}>返回</button>
          <button
            type="button"
            className="flex-1 rounded-xl py-2.5 font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            onClick={handleConfirm}
            disabled={saving}
          >
            {saving ? '处理中...' : '确认取消'}
          </button>
        </div>
      </div>
    </div>
  )
}
