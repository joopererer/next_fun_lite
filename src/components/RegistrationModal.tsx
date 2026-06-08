'use client'

import { SignInButton } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import type { RegistrantContactType } from '../../shared/types'
import { RegistrantContactFields } from './contact/RegistrantContactFields'
import { loadContactPrefs, saveContactPrefs } from '../lib/contactPrefs'

interface Props {
  open: boolean
  onClose: () => void
  activityTitle: string
  participantCount: number
  note: string
  onParticipantCountChange: (n: number) => void
  onNoteChange: (note: string) => void
  onSubmit: (data: {
    name: string
    contactType: RegistrantContactType
    contactValue: string
    contactLabel?: string
    wechat?: string
  }) => void
  submitting: boolean
}

export function RegistrationModal({
  open,
  onClose,
  activityTitle,
  participantCount,
  note,
  onParticipantCountChange,
  onNoteChange,
  onSubmit,
  submitting,
}: Props) {
  const [name, setName] = useState('')
  const [contactType, setContactType] = useState<RegistrantContactType>('wechat')
  const [contactValue, setContactValue] = useState('')
  const [contactLabel, setContactLabel] = useState('')

  useEffect(() => {
    if (!open) return
    const prefs = loadContactPrefs()
    if (prefs) {
      setContactType(prefs.contactType)
      setContactValue(prefs.contactValue)
      setContactLabel(prefs.contactLabel ?? '')
    }
  }, [open])

  if (!open) return null

  const handleSubmit = () => {
    if (!name.trim() || !contactValue.trim()) return
    const payload = {
      name: name.trim(),
      contactType,
      contactValue: contactValue.trim(),
      contactLabel: contactType === 'other' ? contactLabel.trim() || undefined : undefined,
      wechat: contactType === 'wechat' ? contactValue.trim() : undefined,
    }
    saveContactPrefs({
      contactType,
      contactValue: contactValue.trim(),
      contactLabel: contactType === 'other' ? contactLabel.trim() || undefined : undefined,
    })
    onSubmit(payload)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl page-enter max-h-[90vh] overflow-y-auto">
        <div className="px-6 pt-6 pb-5">
          <h2 className="text-xl font-semibold mb-4">报名「{activityTitle}」</h2>

          <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">账号</p>
            <p className="text-sm text-gray-600 -mt-1">登录后报名，方便跨设备管理记录</p>
            <SignInButton mode="modal">
              <button type="button" className="btn-primary w-full rounded-xl py-2.5 text-sm">
                登录 / 注册
              </button>
            </SignInButton>
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <p className="relative text-center text-xs text-gray-400 bg-white px-2 mx-auto w-fit">
                或直接填写（无需登录）
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">姓名/昵称 *</label>
              <input
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="你的昵称"
              />
            </div>
            <RegistrantContactFields
              contactType={contactType}
              contactValue={contactValue}
              contactLabel={contactLabel}
              onTypeChange={setContactType}
              onValueChange={setContactValue}
              onLabelChange={setContactLabel}
            />
          </div>
        </div>

        <div className="border-t-2 border-gray-200 bg-slate-50 rounded-b-2xl px-6 py-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">报名信息</p>
          <p className="text-xs text-gray-500 -mt-2 mb-4">本设备可凭取消链接管理报名</p>

          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">参与人数</label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  className="min-h-[44px] min-w-[44px] rounded-xl border border-gray-200 bg-white text-lg flex items-center justify-center"
                  onClick={() => onParticipantCountChange(Math.max(1, participantCount - 1))}
                >
                  −
                </button>
                <span className="text-lg font-medium w-8 text-center">{participantCount}</span>
                <button
                  type="button"
                  className="min-h-[44px] min-w-[44px] rounded-xl border border-gray-200 bg-white text-lg flex items-center justify-center"
                  onClick={() => onParticipantCountChange(participantCount + 1)}
                >
                  +
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">备注</label>
              <input
                className="input-field bg-white"
                value={note}
                onChange={(e) => onNoteChange(e.target.value)}
                placeholder="过敏/有车等"
              />
            </div>
          </div>

          <button
            type="button"
            className="btn-primary w-full mt-5"
            onClick={handleSubmit}
            disabled={submitting || !name.trim() || !contactValue.trim()}
          >
            {submitting ? '提交中...' : '提交报名'}
          </button>
        </div>

        <div className="px-6 pb-4 bg-slate-50">
          <button type="button" className="text-sm text-gray-400 w-full py-2" onClick={onClose}>
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}
