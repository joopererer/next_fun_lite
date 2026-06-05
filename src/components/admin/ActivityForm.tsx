import type { Activity } from '../../../shared/types'
import { RecruitForm } from '../recruit/RecruitForm'

interface Props {
  initial?: Partial<Activity>
  editId?: string
  onSuccess?: (activity: Activity) => void
}

export function ActivityForm({ initial, editId, onSuccess }: Props) {
  return (
    <RecruitForm
      mode="admin"
      initial={initial}
      editId={editId}
      onSuccess={onSuccess}
    />
  )
}
