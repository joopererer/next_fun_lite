import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { ActivityWithCount } from '../../shared/types'
import { CapacityBar } from '../components/CapacityBar'
import { Header } from '../components/layout/Header'
import { UserIdentityModal } from '../components/UserIdentityModal'
import { api } from '../lib/api'
import { getCategoryEmoji, getCategoryLabel } from '../lib/categories'
import { formatEventDate, getUser, setInterest } from '../lib/user'

export function EventPage() {
  const { id } = useParams<{ id: string }>()
  const [activity, setActivity] = useState<ActivityWithCount | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [success, setSuccess] = useState(false)
  const [registeredCount, setRegisteredCount] = useState(0)

  const [name, setName] = useState('')
  const [wechat, setWechat] = useState('')
  const [participantCount, setParticipantCount] = useState(1)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [identityModal, setIdentityModal] = useState(false)
  const [interested, setInterested] = useState(false)
  const [interestCount, setInterestCount] = useState(0)
  const [interestLoading, setInterestLoading] = useState(false)

  useEffect(() => {
    const user = getUser()
    if (user) {
      setName(user.name)
      setWechat(user.wechat)
    }
  }, [])

  useEffect(() => {
    if (!id) return
    api.getActivity(id)
      .then((a) => {
        setActivity(a)
        setInterestCount(a.interestedCount ?? 0)
        setRegisteredCount(a.registeredCount)

        const user = getUser()
        if (!user) {
          setInterested(false)
          return
        }
        return api.getInterests(a.id).then((interests) => {
          const mine = interests.some((i) => i.wechat === user.wechat)
          setInterested(mine)
          setInterest(a.id, mine)
        })
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  const toggleInterest = async () => {
    const user = getUser()
    if (!user || !activity) {
      setIdentityModal(true)
      return
    }
    if (interestLoading) return
    setInterestLoading(true)
    try {
      const res = interested
        ? await api.deleteInterest({ activityId: activity.id, wechat: user.wechat })
        : await api.createInterest({
            activityId: activity.id,
            name: user.name,
            wechat: user.wechat,
          })

      const nextCount =
        typeof res.interestedCount === 'number'
          ? res.interestedCount
          : interested
            ? Math.max(0, interestCount - 1)
            : interestCount + 1
      const nextInterested = !interested

      setInterested(nextInterested)
      setInterest(activity.id, nextInterested)
      setInterestCount(nextCount)
      setActivity((prev) => (prev ? { ...prev, interestedCount: nextCount } : prev))
    } catch (err) {
      alert(err instanceof Error ? err.message : '操作失败')
    } finally {
      setInterestLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!name.trim() || !wechat.trim()) {
      setIdentityModal(true)
      return
    }
    if (!id || !activity || activity.status !== 'recruiting') return
    if (activity.maxParticipants != null && activity.registeredCount + participantCount > activity.maxParticipants) {
      alert('名额不足')
      return
    }
    setSubmitting(true)
    try {
      await api.createRegistration({
        activityId: id,
        name: name.trim(),
        wechat: wechat.trim(),
        participantCount,
        note: note.trim(),
      })
      setActivity((prev) =>
        prev ? { ...prev, registeredCount: prev.registeredCount + participantCount } : prev
      )
      setRegisteredCount((c) => c + participantCount)
      setSuccess(true)
    } catch (err) {
      alert(err instanceof Error ? err.message : '报名失败')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="text-center text-gray-400 py-16">加载中...</div>
      </div>
    )
  }

  if (notFound || !activity) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="max-w-lg mx-auto px-4 py-16 text-center page-enter">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-xl font-bold mb-2">活动不存在</h2>
          <Link to="/" className="btn-primary inline-block mt-4">回到首页</Link>
        </main>
      </div>
    )
  }

  if (success && activity) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="max-w-lg mx-auto px-4 py-16 page-enter">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-xl font-bold mb-2">报名成功！</h2>
            <p className="text-gray-600">{activity.title}</p>
            <p className="text-sm text-gray-500 mt-2">参与人数：{participantCount} 人</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 mb-6 text-sm text-gray-700 space-y-2">
            <p className="font-medium text-green-800">接下来：</p>
            <p>1. 添加发起人微信确认报名</p>
            <p>2. 留意活动群通知</p>
            <p>3. 活动当天准时到达集合地点</p>
          </div>
          <p className="text-center text-sm text-gray-600 mb-4">
            发起人微信：<strong>{activity.organizerWechat}</strong>
          </p>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              className="btn-primary w-full"
              onClick={() => navigator.clipboard.writeText(activity.organizerWechat)}
            >
              复制微信号
            </button>
            <Link to="/" className="btn-secondary block text-center">回到首页</Link>
          </div>
        </main>
      </div>
    )
  }

  const displayCount = activity.registeredCount ?? registeredCount
  const full = activity.maxParticipants != null && displayCount >= activity.maxParticipants
  const ended = activity.status === 'ended'

  const notes = activity.notes ? activity.notes.split('\n').filter(Boolean) : []

  return (
    <div className="min-h-screen pb-16">
      <Header />
      <main className="max-w-lg mx-auto px-4 py-6 page-enter">
        <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full inline-block mb-2">
          {getCategoryEmoji(activity.category)} {getCategoryLabel(activity.category)}
        </span>
        <h1 className="text-2xl font-bold mb-4">{activity.title}</h1>

        {activity.status === 'proposed' && (
          <div className="bg-blue-50 text-blue-800 text-sm rounded-xl p-3 mb-4">
            💡 这是一个提议，尚未开始招募。感兴趣的人多了，管理员会发起正式活动。
          </div>
        )}

        <div className="space-y-2 text-sm text-gray-600 mb-6">
          <p>📅 {formatEventDate(activity.date)}</p>
          <p>📍 {activity.location || '地点待定'}</p>
          {activity.status === 'recruiting' && (
            <div>
              <p className="mb-1">👥 已报名 {displayCount}{activity.maxParticipants ? ` / ${activity.maxParticipants}` : ''} 人</p>
              <CapacityBar current={displayCount} max={activity.maxParticipants} />
            </div>
          )}
          {activity.status === 'proposed' && (
            <p>💡 {interestCount} 人感兴趣</p>
          )}
          {activity.fee && <p>💰 {activity.fee}</p>}
          {activity.sourceUrl && (
            <a href={activity.sourceUrl} target="_blank" rel="noreferrer" className="text-green-600 underline block truncate">
              🔗 参考链接
            </a>
          )}
        </div>

        {activity.description && (
          <div className="mb-6">
            <p className={`text-gray-700 whitespace-pre-wrap ${expanded ? '' : 'line-clamp-4'}`}>
              {activity.description}
            </p>
            {activity.description.length > 120 && (
              <button type="button" className="text-green-600 text-sm mt-1" onClick={() => setExpanded(!expanded)}>
                {expanded ? '收起 ▴' : '展开全文 ▾'}
              </button>
            )}
          </div>
        )}

        {notes.length > 0 && (
          <div className="bg-amber-50 rounded-xl p-4 mb-8">
            <p className="font-medium text-amber-800 mb-2">⚠️ 注意事项</p>
            <ul className="text-sm text-amber-700 space-y-1">
              {notes.map((n) => <li key={n}>· {n}</li>)}
            </ul>
          </div>
        )}

        {ended && activity.recap && (
          <div className="bg-purple-50 rounded-xl p-4 mb-8">
            <p className="font-medium text-purple-800 mb-2">📝 活动回顾</p>
            <p className="text-sm text-purple-900 whitespace-pre-wrap">{activity.recap}</p>
            {activity.recapImages && (
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {activity.recapImages.split('\n').filter(Boolean).map((url) => (
                  <img key={url} src={url.trim()} alt="" className="h-24 w-24 object-cover rounded-lg shrink-0" />
                ))}
              </div>
            )}
          </div>
        )}

        {ended ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl text-gray-500">
            本次活动已结束
          </div>
        ) : full ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl text-gray-500">
            名额已满（{displayCount}/{activity.maxParticipants}）
          </div>
        ) : activity.status === 'proposed' ? (
          <div className="space-y-4">
            <button
              type="button"
              className={`w-full rounded-xl py-3 font-medium border transition-colors ${
                interested
                  ? 'border-green-300 bg-green-50 text-green-700'
                  : 'btn-primary'
              }`}
              onClick={toggleInterest}
              disabled={interestLoading}
            >
              {interestLoading ? '...' : interested ? '💔 取消感兴趣' : '❤️ 我也感兴趣'}
            </button>
            <Link to="/" className="btn-secondary block text-center">回到首页</Link>
          </div>
        ) : activity.status !== 'recruiting' ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl text-gray-500">
            该活动暂未开放报名
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 text-gray-400 text-sm mb-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span>我要报名</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">姓名/昵称 *</label>
                <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">微信号 *</label>
                <input className="input-field" value={wechat} onChange={(e) => setWechat(e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">参与人数（含同行）</label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    className="min-h-[44px] min-w-[44px] rounded-xl border border-gray-200 text-lg flex items-center justify-center"
                    onClick={() => setParticipantCount(Math.max(1, participantCount - 1))}
                  >
                    −
                  </button>
                  <span className="text-lg font-medium w-8 text-center">{participantCount}</span>
                  <button
                    type="button"
                    className="min-h-[44px] min-w-[44px] rounded-xl border border-gray-200 text-lg flex items-center justify-center"
                    onClick={() => setParticipantCount(participantCount + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">备注（过敏/有车等）</label>
                <input className="input-field" value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
            </div>

            <div className="sticky bottom-0 bg-warm-bg pt-3 pb-safe -mx-4 px-4">
              <button type="button" className="btn-primary w-full text-lg" onClick={handleSubmit} disabled={submitting}>
                {submitting ? '提交中...' : '提交报名'}
              </button>
            </div>
          </>
        )}

        <div className="mt-8 text-sm text-gray-500 text-center">
          <p>发起人：{activity.organizerName}</p>
          {activity.organizerWechat && <p>报名后添加微信：{activity.organizerWechat}</p>}
        </div>
      </main>
      <UserIdentityModal open={identityModal} onClose={() => setIdentityModal(false)} />
    </div>
  )
}
