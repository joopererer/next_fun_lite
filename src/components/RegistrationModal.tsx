'use client'

import { SignInButton } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import type { RegistrantContactType } from '../../shared/types'
import { RegistrantContactFields } from './contact/RegistrantContactFields'
import { ModalSheet } from './ui/ModalSheet'
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
  signedInDisplayName?: string
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
  signedInDisplayName,
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

  const signedInMode = Boolean(signedInDisplayName)

  const handleSubmit = () => {
    if (signedInMode) {
      onSubmit({
        name: signedInDisplayName!,
        contactType: 'wechat',
        contactValue: '',
      })
      return
    }
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

  const footer = (
    <>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">报名信息</p>
      {!signedInMode && (
        <p className="text-xs text-gray-500 mb-3">本设备可凭取消链接管理报名</p>
      )}
      <div className="space-y-2.5 sm:space-y-3">
        <div>
          <label className="text-xs sm:text-sm text-gray-600 mb-1 block">参与人数</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl border border-gray-200 bg-white text-base flex items-center justify-center"
              onClick={() => onParticipantCountChange(Math.max(1, participantCount - 1))}
            >
              −
            </button>
            <span className="text-base font-medium w-6 text-center">{participantCount}</span>
            <button
              type="button"
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl border border-gray-200 bg-white text-base flex items-center justify-center"
              onClick={() => onParticipantCountChange(participantCount + 1)}
            >
              +
            </button>
          </div>
        </div>
        <div>
          <label className="text-xs sm:text-sm text-gray-600 mb-1 block">备注</label>
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
        className="btn-primary w-full mt-4"
        onClick={handleSubmit}
        disabled={submitting || (!signedInMode && (!name.trim() || !contactValue.trim()))}
      >
        {submitting ? '提交中...' : '提交报名'}
      </button>
    </>
  )

  return (
    <ModalSheet
      open={open}
      onClose={onClose}
      title={<>报名「{activityTitle}」</>}
      footer={footer}
    >
      {signedInMode ? (
        <div className="rounded-xl border border-green-100 bg-green-50 p-3 sm:p-4 text-sm text-gray-700">
          <p>
            以 <span className="font-medium">{signedInDisplayName}</span> 的身份报名
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4 space-y-2.5 sm:space-y-3">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">账号</p>
          <p className="text-xs sm:text-sm text-gray-600 -mt-1">登录后报名，方便跨设备管理记录</p>
          <SignInButton mode="modal">
            <button type="button" className="btn-primary w-full rounded-xl py-2 text-sm">
              登录 / 注册
            </button>
          </SignInButton>
          <div className="relative py-1.5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <p className="relative text-center text-xs text-gray-400 bg-white px-2 mx-auto w-fit">
              或直接填写（无需登录）
            </p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 mb-1 block">姓名/昵称 *</label>
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
      )}
    </ModalSheet>
  )
}
