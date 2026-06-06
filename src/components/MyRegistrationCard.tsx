'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { ActivityWithCount, Registration } from '../../shared/types'
import { getCancelReasonLabel, isEndedCancelled } from '../lib/activityStatus'
import { getCategoryEmoji, getCategoryLabel } from '../lib/categories'
import { formatEventDate } from '../lib/user'
import { api, getCancelUrl } from '../lib/api'

interface Props {
  activity: ActivityWithCount
  registration?: Registration | null
  onCancel?: () => void
}

export function MyRegistrationCard({ activity, registration, onCancel }: Props) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const canCancel =
    registration &&
    !registration.cancelledAt &&
    activity.status === 'recruiting'

  const isGuestRegistration = Boolean(registration?.cancelToken && registration.id.startsWith('guest-'))

  const handleCancel = async () => {
    if (!registration || cancelling || isGuestRegistration) return
    setCancelling(true)
    try {
      await api.cancelRegistrationById(registration.id)
      setShowConfirm(false)
      onCancel?.()
    } catch (err) {
      alert(err instanceof Error ? err.message : '取消失败')
    } finally {
      setCancelling(false)
    }
  }

  if (isEndedCancelled(activity.status)) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-red-200 border-l-4 border-l-red-500">
        <p className="text-sm text-red-600 font-medium mb-2">❌ 活动已取消</p>
        <h3 className="font-semibold text-base mb-2">{activity.title}</h3>
        <p className="text-sm text-gray-600 mb-1">
          原因：{getCancelReasonLabel(activity.cancelReason)}
        </p>
        {activity.cancelNote && (
          <p className="text-sm text-gray-500 mb-2 whitespace-pre-wrap">{activity.cancelNote}</p>
        )}
        <p className="text-xs text-gray-500 mb-3">
          如有疑问联系：{activity.organizerWechat}
        </p>
        <Link href={`/event/${activity.id}`} className="text-sm text-green-600 hover:underline">
          查看详情
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full inline-block mb-2">
          {getCategoryEmoji(activity.category)} {getCategoryLabel(activity.category)}
        </span>
        <h3 className="font-semibold text-base mb-2">{activity.title}</h3>
        <p className="text-sm text-gray-500 mb-1">📅 {formatEventDate(activity.date)}</p>
        <p className="text-sm text-gray-500 mb-1">📍 {activity.location || '地点待定'}</p>
        <p className="text-sm text-gray-500 mb-2">👤 {activity.organizerName} 发起</p>
        {registration && (
          <p className="text-sm text-green-700 mb-3">你的报名：{registration.participantCount}人</p>
        )}
        <div className="flex items-center justify-between">
          <Link href={`/event/${activity.id}`} className="text-sm text-green-600 hover:underline">
            查看详情
          </Link>
          {canCancel && (
            isGuestRegistration && registration.cancelToken ? (
              <Link
                href={getCancelUrl(registration.cancelToken)}
                className="text-xs text-gray-400 hover:text-red-500"
              >
                取消报名
              </Link>
            ) : (
              <button
                type="button"
                className="text-xs text-gray-400 hover:text-red-500"
                onClick={() => setShowConfirm(true)}
              >
                取消报名
              </button>
            )
          )}
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <h3 className="font-semibold mb-2">确认取消「{activity.title}」的报名？</h3>
            <p className="text-sm text-gray-500 mb-6">
              取消后名额将释放，如需重新参加请再次报名。
            </p>
            <div className="flex gap-3">
              <button type="button" className="btn-primary flex-1" onClick={handleCancel} disabled={cancelling}>
                {cancelling ? '处理中...' : '确认取消'}
              </button>
              <button type="button" className="btn-secondary flex-1" onClick={() => setShowConfirm(false)}>
                返回
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
