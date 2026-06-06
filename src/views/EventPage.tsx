'use client'

import { SignInButton, useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import type { ActivityWithCount, Profile, Registration } from '../../shared/types'
import { ItineraryBlock } from '../components/ItineraryBlock'
import { Header } from '../components/layout/Header'
import { api } from '../lib/api'
import { getCancelReasonLabel, isEndedCancelled, isEndedSuccess } from '../lib/activityStatus'
import { getCategoryEmoji, getCategoryLabel } from '../lib/categories'
import { isRegistrationFull } from '../lib/participants'
import { getClerkDisplayName } from '../lib/displayName'
import { formatEventDate } from '../lib/user'
import { CapacityBar } from '../components/CapacityBar'

export function EventPage() {
  const { id } = useParams<{ id: string }>()
  const { isSignedIn, isLoaded, user: clerkUser } = useUser()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [activity, setActivity] = useState<ActivityWithCount | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [success, setSuccess] = useState(false)
  const [registeredCount, setRegisteredCount] = useState(0)

  const [participantCount, setParticipantCount] = useState(1)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [interested, setInterested] = useState(false)
  const [interestCount, setInterestCount] = useState(0)
  const [interestLoading, setInterestLoading] = useState(false)
  const [myRegistration, setMyRegistration] = useState<Registration | null>(null)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [sourceProposal, setSourceProposal] = useState<ActivityWithCount | null | undefined>(undefined)

  const displayName = profile?.nickname || getClerkDisplayName(clerkUser)

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    api.getProfile()
      .then((p) => setProfile(p))
      .catch(() => {})
  }, [isLoaded, isSignedIn])

  useEffect(() => {
    if (!id || !isLoaded) return
    api.getActivity(id)
      .then((a) => {
        setActivity(a)
        setInterestCount(a.interestedCount ?? 0)
        setRegisteredCount(a.registeredCount)

        if (a.sourceProposalId) {
          api.getActivity(a.sourceProposalId)
            .then((p) => setSourceProposal(p))
            .catch(() => setSourceProposal(null))
        } else {
          setSourceProposal(undefined)
        }

        if (!isSignedIn || !clerkUser?.id) {
          setInterested(false)
          setMyRegistration(null)
          return
        }

        return Promise.all([
          api.getInterests(a.id),
          a.status === 'recruiting' ? api.getMyRegistration(a.id) : Promise.resolve(null),
        ]).then(([interests, regResult]) => {
          setInterested(interests.some((i) => i.userId === clerkUser.id))
          if (regResult?.registration) {
            setMyRegistration(regResult.registration)
            setParticipantCount(regResult.registration.participantCount)
            setNote(regResult.registration.note)
          } else {
            setMyRegistration(null)
          }
        })
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id, isLoaded, isSignedIn, clerkUser?.id])

  const toggleInterest = async () => {
    if (!activity || !isSignedIn || interestLoading) return
    setInterestLoading(true)
    try {
      const res = interested
        ? await api.deleteInterest({ activityId: activity.id })
        : await api.createInterest({ activityId: activity.id })
      const nextCount =
        typeof res.interestedCount === 'number'
          ? res.interestedCount
          : interested
            ? Math.max(0, interestCount - 1)
            : interestCount + 1
      setInterested(!interested)
      setInterestCount(nextCount)
      setActivity((prev) => (prev ? { ...prev, interestedCount: nextCount } : prev))
    } catch (err) {
      alert(err instanceof Error ? err.message : '操作失败')
    } finally {
      setInterestLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!isSignedIn || !id || !activity || activity.status !== 'recruiting' || myRegistration) return
    if (activity.maxParticipants != null && activity.registeredCount + participantCount > activity.maxParticipants) {
      alert('名额不足')
      return
    }
    setSubmitting(true)
    try {
      const res = await api.createRegistration({
        activityId: id,
        participantCount,
        note: note.trim(),
      })
      setMyRegistration(res.registration ?? null)
      setActivity((prev) =>
        prev ? { ...prev, registeredCount: res.registeredCount } : prev
      )
      setRegisteredCount(res.registeredCount)
      setSuccess(true)
    } catch (err) {
      alert(err instanceof Error ? err.message : '报名失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancelRegistration = async () => {
    if (!activity || !myRegistration || !isSignedIn) return
    if (!confirm('确定取消报名？')) return
    setCancelLoading(true)
    try {
      const res = await api.cancelRegistration({ activityId: activity.id })
      setMyRegistration(null)
      setSuccess(false)
      setActivity((prev) =>
        prev ? { ...prev, registeredCount: res.registeredCount } : prev
      )
      setRegisteredCount(res.registeredCount)
    } catch (err) {
      alert(err instanceof Error ? err.message : '取消失败')
    } finally {
      setCancelLoading(false)
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
          <Link href="/" className="btn-primary inline-block mt-4">回到首页</Link>
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
            <Link href="/" className="btn-secondary block text-center">回到首页</Link>
          </div>
        </main>
      </div>
    )
  }

  const displayCount = activity.registeredCount ?? registeredCount
  const full = isRegistrationFull(displayCount, activity.maxParticipants)
  const endedSuccess = isEndedSuccess(activity.status)
  const endedCancelled = isEndedCancelled(activity.status)
  const ended = endedSuccess || endedCancelled

  const notes = activity.notes ? activity.notes.split('\n').filter(Boolean) : []

  if (endedCancelled) {
    return (
      <div className="min-h-screen pb-16">
        <Header />
        <main className="max-w-lg mx-auto px-4 py-6 page-enter">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6 text-red-900">
            <p className="font-bold text-lg mb-3">❌ 本次活动已取消</p>
            <p className="text-sm mb-1">原因：{getCancelReasonLabel(activity.cancelReason)}</p>
            {activity.cancelNote && (
              <p className="text-sm whitespace-pre-wrap mb-4 opacity-90">{activity.cancelNote}</p>
            )}
            <p className="text-sm mb-3">如有疑问请联系发起人：</p>
            <p className="font-medium mb-3">{activity.organizerWechat}</p>
            <button
              type="button"
              className="btn-secondary text-sm"
              onClick={() => navigator.clipboard.writeText(activity.organizerWechat)}
            >
              复制微信号
            </button>
          </div>

          <div className="opacity-60 pointer-events-none select-none">
            <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full inline-block mb-2">
              {getCategoryEmoji(activity.category)} {getCategoryLabel(activity.category)}
            </span>
            <h1 className="text-2xl font-bold mb-4">{activity.title}</h1>
            <div className="space-y-2 text-sm text-gray-600 mb-6">
              <p>📅 {formatEventDate(activity.date)}</p>
              <p>📍 {activity.location || '地点待定'}</p>
            </div>
            {activity.description && (
              <p className="text-gray-700 whitespace-pre-wrap mb-6">{activity.description}</p>
            )}
          </div>

          <Link href="/" className="btn-primary block text-center w-full mt-6">回到首页</Link>
        </main>
      </div>
    )
  }

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

        {activity.itinerary && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <ItineraryBlock itinerary={activity.itinerary} />
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

        {endedSuccess && activity.recap && (
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

        {activity.status === 'recruiting' && activity.sourceProposalId && sourceProposal !== undefined && (
          <div className="bg-blue-50 text-blue-800 text-sm rounded-xl p-3 mb-4">
            {sourceProposal ? (
              <>
                💡 本次活动来源于提议「{sourceProposal.title}」{' '}
                <Link href={`/event/${sourceProposal.id}`} className="text-green-700 underline">
                  查看原提议
                </Link>
              </>
            ) : (
              '💡 本次活动来源于一个已删除的提议'
            )}
          </div>
        )}

        {endedSuccess ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl text-gray-500">
            本次活动已结束
          </div>
        ) : full ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl text-gray-500 font-medium">
            已满
          </div>
        ) : activity.status === 'proposed' ? (
          <div className="space-y-4">
            {isSignedIn ? (
              <button
                type="button"
                className={`w-full rounded-xl py-3 font-medium border transition-colors ${
                  interested
                    ? 'border-gray-300 bg-gray-100 text-gray-600'
                    : 'btn-primary'
                }`}
                onClick={toggleInterest}
                disabled={interestLoading}
              >
                {interestLoading ? '...' : interested ? '❤️ 不再感兴趣' : '❤️ 我也感兴趣'}
              </button>
            ) : (
              <SignInButton mode="modal">
                <button type="button" className="btn-primary w-full rounded-xl py-3 font-medium">
                  ❤️ 我也感兴趣
                </button>
              </SignInButton>
            )}
            <Link href="/" className="btn-secondary block text-center">回到首页</Link>
          </div>
        ) : activity.status !== 'recruiting' ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl text-gray-500">
            该活动暂未开放报名
          </div>
        ) : myRegistration ? (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 space-y-1">
              <p>姓名：{myRegistration.name}</p>
              <p>参与人数：{myRegistration.participantCount} 人</p>
              {myRegistration.note && <p>备注：{myRegistration.note}</p>}
            </div>
            <button
              type="button"
              className="w-full rounded-xl py-3 font-medium border border-gray-200 bg-gray-100 text-gray-500 cursor-default"
              disabled
            >
              已报名
            </button>
            <button
              type="button"
              className="w-full rounded-xl py-3 font-medium border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
              onClick={handleCancelRegistration}
              disabled={cancelLoading}
            >
              {cancelLoading ? '取消中...' : '取消报名'}
            </button>
          </div>
        ) : !isSignedIn ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl space-y-4">
            <p className="text-gray-600">登录后即可报名</p>
            <SignInButton mode="modal">
              <button type="button" className="btn-primary">登录 / 注册</button>
            </SignInButton>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 text-gray-400 text-sm mb-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span>我要报名</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="space-y-4 mb-8">
              <div className="bg-green-50 rounded-xl p-4 text-sm text-gray-700">
                <p>以 <span className="font-medium">{displayName}</span> 的身份报名</p>
                {!profile?.wechat && (
                  <p className="text-xs text-gray-500 mt-2">
                    可在头像菜单 → 编辑资料 中补充微信号，方便组织者联系
                  </p>
                )}
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
    </div>
  )
}
