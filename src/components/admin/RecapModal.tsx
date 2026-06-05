import { useState } from 'react'
import type { ActivityWithCount } from '../../../shared/types'
import { api } from '../../lib/api'

interface Props {
  activity: ActivityWithCount
  onSaved?: () => void
}

export function RecapModal({ activity, onSaved }: Props) {
  const [open, setOpen] = useState(false)
  const [recap, setRecap] = useState(activity.recap ?? '')
  const [recapImages, setRecapImages] = useState(activity.recapImages ?? '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.updateActivity(activity.id, { recap: recap.trim(), recapImages: recapImages.trim() })
      setOpen(false)
      onSaved?.()
    } catch (err) {
      alert(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <button
        type="button"
        className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
        onClick={() => {
          setRecap(activity.recap ?? '')
          setRecapImages(activity.recapImages ?? '')
          setOpen(true)
        }}
      >
        {activity.recap ? '编辑回顾' : '写回顾'}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 sm:p-8">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-xl">
            <h3 className="font-bold text-xl mb-5">活动回顾 · {activity.title}</h3>
            <div className="space-y-5">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">回顾文字</label>
                <textarea
                  className="input-field min-h-[200px] text-base"
                  value={recap}
                  onChange={(e) => setRecap(e.target.value)}
                  placeholder="活动总结、感受..."
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">回顾图片（每行一个 URL）</label>
                <textarea
                  className="input-field min-h-[120px] text-base"
                  value={recapImages}
                  onChange={(e) => setRecapImages(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button type="button" className="btn-secondary flex-1" onClick={() => setOpen(false)}>取消</button>
              <button type="button" className="btn-primary flex-1" onClick={handleSave} disabled={saving}>
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
