import { useState } from 'react'
import type { ActivityWithCount } from '../../../shared/types'
import { api } from '../../lib/api'
import { CancelActivityModal } from './CancelActivityModal'

interface Props {
  activity: ActivityWithCount
  open: boolean
  onClose: () => void
  onSaved?: () => void
}

type EndMode = 'success' | 'cancel'

export function EndActivityModal({ activity, open, onClose, onSaved }: Props) {
  const [mode, setMode] = useState<EndMode>('success')
  const [recap, setRecap] = useState(activity.recap ?? '')
  const [recapImages, setRecapImages] = useState(activity.recapImages ?? '')
  const [saving, setSaving] = useState(false)
  const [showCancel, setShowCancel] = useState(false)

  if (!open) return null

  if (showCancel) {
    return (
      <CancelActivityModal
        activity={activity}
        open
        onClose={() => {
          setShowCancel(false)
          onClose()
        }}
        onSaved={onSaved}
      />
    )
  }

  const handleConfirm = async () => {
    if (mode === 'cancel') {
      setShowCancel(true)
      return
    }
    setSaving(true)
    try {
      await api.updateActivity(activity.id, {
        status: 'ended_success',
        recap: recap.trim(),
        recapImages: recapImages.trim(),
        endedAt: new Date().toISOString(),
      })
      onClose()
      onSaved?.()
    } catch (err) {
      alert(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl max-h-[92vh] overflow-y-auto">
        <h3 className="font-bold text-lg mb-4">活动结束</h3>
        <p className="text-sm text-gray-600 mb-4">请选择结束方式：</p>

        <div className="space-y-4 mb-6">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="radio"
              name="endMode"
              checked={mode === 'success'}
              onChange={() => setMode('success')}
              className="mt-1"
            />
            <span className="text-sm">
              <span className="font-medium block">✅ 圆满举办</span>
            </span>
          </label>

          {mode === 'success' && (
            <div className="ml-6 space-y-3">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">活动回顾（选填）</label>
                <textarea
                  className="input-field min-h-[100px]"
                  value={recap}
                  onChange={(e) => setRecap(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">活动照片链接（选填）</label>
                <textarea
                  className="input-field min-h-[60px]"
                  value={recapImages}
                  onChange={(e) => setRecapImages(e.target.value)}
                  placeholder="多个链接用换行分隔"
                />
              </div>
            </div>
          )}

          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input
              type="radio"
              name="endMode"
              checked={mode === 'cancel'}
              onChange={() => setMode('cancel')}
            />
            <span>❌ 活动取消</span>
          </label>
        </div>

        <div className="flex gap-3">
          <button type="button" className="btn-secondary flex-1" onClick={onClose}>返回</button>
          <button type="button" className="btn-primary flex-1" onClick={handleConfirm} disabled={saving}>
            {saving ? '保存中...' : mode === 'cancel' ? '下一步' : '确认结束'}
          </button>
        </div>
      </div>
    </div>
  )
}
