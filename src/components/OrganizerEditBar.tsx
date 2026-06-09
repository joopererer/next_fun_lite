'use client'

import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import type { Activity } from '../../shared/types'
import { isInfoPost } from '@/src/lib/infoVisibility'
import { canOrganizerEditActivity, getOrganizerEditHref } from '@/src/lib/organizerEdit'
import { InfoEditModal } from './info/InfoEditModal'
import { useState } from 'react'

interface Props {
  activity: Activity
  onUpdated?: (activity: Activity) => void
}

export function OrganizerEditBar({ activity, onUpdated }: Props) {
  const { user, isSignedIn, isLoaded } = useUser()
  const [infoModalOpen, setInfoModalOpen] = useState(false)

  if (!isLoaded || !isSignedIn || !canOrganizerEditActivity(activity, user?.id)) {
    return null
  }

  const editHref = getOrganizerEditHref(activity)

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {isInfoPost(activity) ? (
        <>
          <button
            type="button"
            className="text-sm px-3 py-1.5 rounded-lg border border-green-200 text-green-700 hover:bg-green-50"
            onClick={() => setInfoModalOpen(true)}
          >
            编辑
          </button>
          <InfoEditModal
            open={infoModalOpen}
            activity={activity}
            onClose={() => setInfoModalOpen(false)}
            onSuccess={(updated) => onUpdated?.(updated)}
          />
        </>
      ) : editHref ? (
        <Link
          href={editHref}
          className="text-sm px-3 py-1.5 rounded-lg border border-green-200 text-green-700 hover:bg-green-50"
        >
          编辑
        </Link>
      ) : null}
    </div>
  )
}
