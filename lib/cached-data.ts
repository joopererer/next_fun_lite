import { unstable_cache } from 'next/cache'
import { getEnvConfig } from '@/lib/env'
import { enrichActivity } from '@/server/lib/enrichActivity'
import { createStorageAdapter } from '@/server/storage'
import { isEndedCancelled, isEndedSuccess } from '@/shared/activityStatus'
import { isInfoPost, isInfoVisible, isProposalPost, sortInfosForHome } from '@/shared/infoVisibility'
import { sortProposalsForHome } from '@/src/lib/proposals'
import type { ActivityWithCount } from '@/shared/types'

export const getCachedEnrichedActivities = unstable_cache(
  async (): Promise<ActivityWithCount[]> => {
    const storage = createStorageAdapter(getEnvConfig())
    const list = await storage.getActivities()
    return Promise.all(list.map((a) => enrichActivity(storage, a)))
  },
  ['enriched-activities'],
  { revalidate: 60, tags: ['activities'] },
)

export async function getCachedRecruitingActivities(): Promise<ActivityWithCount[]> {
  const all = await getCachedEnrichedActivities()
  return all.filter((a) => a.status === 'recruiting' && !isInfoPost(a))
}

export async function getCachedInfoPosts(): Promise<ActivityWithCount[]> {
  const all = await getCachedEnrichedActivities()
  return sortInfosForHome(all.filter((a) => isInfoPost(a)))
}

export async function getCachedProposedActivities(): Promise<{
  proposed: ActivityWithCount[]
  proposedAll: ActivityWithCount[]
}> {
  const all = await getCachedEnrichedActivities()
  const proposedAll = all.filter((a) => isProposalPost(a))
  return {
    proposedAll,
    proposed: sortProposalsForHome(proposedAll),
  }
}

export async function getCachedPastActivities(): Promise<ActivityWithCount[]> {
  const all = await getCachedEnrichedActivities()
  return all.filter((a) => !isEndedCancelled(a.status) && isEndedSuccess(a.status))
}

export async function getCachedAllVisibleInfos(): Promise<ActivityWithCount[]> {
  const all = await getCachedEnrichedActivities()
  return all.filter((a) => isInfoPost(a) && isInfoVisible(a))
}

export async function getCachedActivityById(id: string): Promise<ActivityWithCount | null> {
  const all = await getCachedEnrichedActivities()
  return all.find((a) => a.id === id) ?? null
}
