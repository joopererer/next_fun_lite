import QRCode from 'qrcode'
import { useEffect, useState } from 'react'
import type { Activity, ActivityStatus } from '../../../shared/types'
import { api, getEventUrl } from '../../lib/api'

interface Props {
  initial?: Partial<Activity>
  editId?: string
  onSuccess?: (activity: Activity) => void
}

export function ActivityForm({ initial, editId, onSuccess }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [date, setDate] = useState(initial?.date?.slice(0, 16) ?? '')
  const [location, setLocation] = useState(initial?.location ?? '')
  const [maxParticipants, setMaxParticipants] = useState(initial?.maxParticipants?.toString() ?? '')
  const [fee, setFee] = useState(initial?.fee ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [organizerName, setOrganizerName] = useState(initial?.organizerName ?? '')
  const [organizerWechat, setOrganizerWechat] = useState(initial?.organizerWechat ?? '')
  const [sourceUrl, setSourceUrl] = useState(initial?.sourceUrl ?? '')
  const [status, setStatus] = useState<ActivityStatus>(initial?.status ?? 'recruiting')
  const [submitting, setSubmitting] = useState(false)
  const [created, setCreated] = useState<Activity | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState('')

  useEffect(() => {
    if (initial) {
      setTitle(initial.title ?? '')
      setDescription(initial.description ?? '')
      setDate(initial.date?.slice(0, 16) ?? '')
      setLocation(initial.location ?? '')
      setMaxParticipants(initial.maxParticipants?.toString() ?? '')
      setFee(initial.fee ?? '')
      setNotes(initial.notes ?? '')
      setOrganizerName(initial.organizerName ?? '')
      setOrganizerWechat(initial.organizerWechat ?? '')
      setSourceUrl(initial.sourceUrl ?? '')
      setStatus(initial.status ?? 'recruiting')
    }
  }, [initial])

  const handleSubmit = async () => {
    if (!title.trim() || !organizerName.trim() || !organizerWechat.trim()) {
      alert('请填写标题、发起人昵称和微信号')
      return
    }
    setSubmitting(true)
    const data: Partial<Activity> = {
      title: title.trim(),
      description: description.trim(),
      date: date ? new Date(date).toISOString() : null,
      location: location.trim(),
      maxParticipants: maxParticipants ? parseInt(maxParticipants, 10) : null,
      fee: fee.trim(),
      notes: notes.trim(),
      organizerName: organizerName.trim(),
      organizerWechat: organizerWechat.trim(),
      sourceUrl: sourceUrl.trim(),
      status,
    }
    try {
      const result = editId
        ? await api.updateActivity(editId, data)
        : await api.createActivity(data)
      if (editId) {
        onSuccess?.(result)
        return
      }
      setCreated(result)
      const url = getEventUrl(result.id)
      const qr = await QRCode.toDataURL(url, { width: 200 })
      setQrDataUrl(qr)
      onSuccess?.(result)
    } catch (err) {
      alert(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSubmitting(false)
    }
  }

  if (created) {
    const url = getEventUrl(created.id)
    return (
      <div className="text-center py-8 page-enter">
        <div className="text-4xl mb-3">✅</div>
        <h3 className="text-xl font-bold mb-4">招募已创建</h3>
        <p className="text-sm text-gray-600 mb-2 break-all">报名链接：{url}</p>
        <div className="flex gap-3 justify-center mb-4">
          <button type="button" className="btn-primary" onClick={() => navigator.clipboard.writeText(url)}>
            复制链接
          </button>
        </div>
        {qrDataUrl && (
          <div>
            <p className="text-sm text-gray-500 mb-2">查看二维码</p>
            <img src={qrDataUrl} alt="QR Code" className="mx-auto rounded-xl" />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-lg">
      <div>
        <label className="text-sm text-gray-600 mb-1 block">活动名称 *</label>
        <input className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <label className="text-sm text-gray-600 mb-1 block">简介</label>
        <textarea className="input-field min-h-[80px]" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div>
        <label className="text-sm text-gray-600 mb-1 block">参考链接</label>
        <input className="input-field" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-gray-600 mb-1 block">活动时间</label>
          <input type="datetime-local" className="input-field" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">状态</label>
          <select className="input-field" value={status} onChange={(e) => setStatus(e.target.value as ActivityStatus)}>
            <option value="proposed">提议池</option>
            <option value="recruiting">招募中</option>
            <option value="ended">已结束</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-sm text-gray-600 mb-1 block">地点</label>
        <input className="input-field" value={location} onChange={(e) => setLocation(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-gray-600 mb-1 block">目标人数</label>
          <input type="number" className="input-field" value={maxParticipants} onChange={(e) => setMaxParticipants(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">费用说明</label>
          <input className="input-field" value={fee} onChange={(e) => setFee(e.target.value)} />
        </div>
      </div>
      <div>
        <label className="text-sm text-gray-600 mb-1 block">注意事项</label>
        <textarea className="input-field min-h-[60px]" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="多条用换行分隔" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-gray-600 mb-1 block">发起人昵称 *</label>
          <input className="input-field" value={organizerName} onChange={(e) => setOrganizerName(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">发起人微信号 *</label>
          <input className="input-field" value={organizerWechat} onChange={(e) => setOrganizerWechat(e.target.value)} />
        </div>
      </div>
      <button type="button" className="btn-primary w-full" onClick={handleSubmit} disabled={submitting}>
        {submitting ? '保存中...' : editId ? '更新活动' : '创建活动'}
      </button>
    </div>
  )
}
