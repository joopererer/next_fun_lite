'use client'

import type { AvatarPreview } from './AvatarStack'
import { AvatarStack } from './AvatarStack'

interface Props {
  total: number
  previews: AvatarPreview[]
  loading?: boolean
}

export function RegistrationPreview({ total, previews, loading }: Props) {
  return (
    <div className="h-8 flex items-center mb-3">
      {loading ? (
        <span className="text-xs text-gray-300">加载中...</span>
      ) : total > 0 ? (
        <AvatarStack previews={previews} total={total} />
      ) : (
        <span className="text-xs text-gray-400">暂无参与者</span>
      )}
    </div>
  )
}
