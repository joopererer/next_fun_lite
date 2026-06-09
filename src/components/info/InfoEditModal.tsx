'use client'

import type { Activity } from '../../../shared/types'
import { InfoForm } from './InfoForm'

interface Props {
  open: boolean
  activity: Activity
  onClose: () => void
  onSuccess: (activity: Activity) => void
}

export function InfoEditModal({ open, activity, onClose, onSuccess }: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="关闭"
        onClick={onClose}
      />
      <div className="relative bg-white w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">编辑资讯</h2>
          <button type="button" className="text-gray-400 hover:text-gray-600 text-xl leading-none" onClick={onClose}>
            ×
          </button>
        </div>
        <InfoForm
          mode="edit"
          initial={activity}
          editId={activity.id}
          onSuccess={(updated) => {
            onSuccess(updated)
            onClose()
          }}
        />
      </div>
    </div>
  )
}
