'use client'

import { SignInButton } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import type { RegistrantContactType } from '../../shared/types'
import { RegistrantContactFields } from './contact/RegistrantContactFields'
import { ModalSheet } from './ui/ModalSheet'
import { loadContactPrefs, saveContactPrefs } from '../lib/contactPrefs'
import { useT } from '../i18n/LanguageContext'

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
  const t = useT()
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
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{t.registrationInfoLabel}</p>
      {!signedInMode && (
        <p className="text-xs text-gray-500 mb-3">{t.guestRegistrationHint}</p>
      )}
      <div className="space-y-2.5 sm:space-y-3">
        <div>
          <label className="text-xs sm:text-sm text-gray-600 mb-1 block">{t.participantCount}</label>
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
          <label className="text-xs sm:text-sm text-gray-600 mb-1 block">{t.noteLabel}</label>
          <input
            className="input-field bg-white"
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder={t.notePlaceholder}
          />
        </div>
      </div>
      <button
        type="button"
        className="btn-primary w-full mt-4"
        onClick={handleSubmit}
        disabled={submitting || (!signedInMode && (!name.trim() || !contactValue.trim()))}
      >
        {submitting ? t.submitting : t.submitRegistration}
      </button>
    </>
  )

  return (
    <ModalSheet
      open={open}
      onClose={onClose}
      title={<>{t.registerTitle(activityTitle)}</>}
      footer={footer}
    >
      {signedInMode ? (
        <div className="rounded-xl border border-green-100 bg-green-50 p-3 sm:p-4 text-sm text-gray-700">
          <p>{t.registerAs(signedInDisplayName!)}</p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4 space-y-2.5 sm:space-y-3">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{t.accountLabel}</p>
          <p className="text-xs sm:text-sm text-gray-600 -mt-1">{t.loginToManage}</p>
          <SignInButton mode="modal">
            <button type="button" className="btn-primary w-full rounded-xl py-2 text-sm">
              {t.signInButton}
            </button>
          </SignInButton>
          <div className="relative py-1.5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <p className="relative text-center text-xs text-gray-400 bg-white px-2 mx-auto w-fit">
              {t.orFillDirectly}
            </p>
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 mb-1 block">{t.nameLabel}</label>
            <input
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.namePlaceholder}
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
