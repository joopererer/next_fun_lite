'use client'

import type { Activity } from '../../../shared/types'
import { ModalSheet } from '../ui/ModalSheet'
import { InfoForm } from './InfoForm'

interface Props {
  open: boolean
  activity: Activity
  onClose: () => void
  onSuccess: (activity: Activity) => void
}

export function InfoEditModal({ open, activity, onClose, onSuccess }: Props) {
  return (
    <ModalSheet open={open} onClose={onClose} title="编辑资讯">
      <InfoForm
        mode="edit"
        initial={activity}
        editId={activity.id}
        onSuccess={(updated) => {
          onSuccess(updated)
          onClose()
        }}
      />
    </ModalSheet>
  )
}
