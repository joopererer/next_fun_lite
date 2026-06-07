import type { ActivityWithCount } from '@/shared/types'
import { isProposalExpired } from '@/src/lib/activityPhase'

const HOT_THRESHOLD = 3
export const HOME_PROPOSAL_LIMIT = 6

export type ProposalSort = 'newest' | 'most_interested' | 'oldest'

function proposalSortKey(p: ActivityWithCount): number {
  return isProposalExpired(p) ? 1 : 0
}

export function sortProposalsForHome(proposals: ActivityWithCount[]): ActivityWithCount[] {
  const hot = proposals
    .filter((p) => (p.interestedCount ?? 0) >= HOT_THRESHOLD)
    .sort((a, b) => proposalSortKey(a) - proposalSortKey(b) || (b.interestedCount ?? 0) - (a.interestedCount ?? 0))

  const hotIds = new Set(hot.map((p) => p.id))
  const rest = proposals
    .filter((p) => !hotIds.has(p.id))
    .sort((a, b) =>
      proposalSortKey(a) - proposalSortKey(b) ||
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )

  return [...hot, ...rest].slice(0, HOME_PROPOSAL_LIMIT)
}

export function sortProposals(proposals: ActivityWithCount[], sort: ProposalSort): ActivityWithCount[] {
  const copy = [...proposals]
  const expiredKey = (a: ActivityWithCount, b: ActivityWithCount) => proposalSortKey(a) - proposalSortKey(b)
  switch (sort) {
    case 'most_interested':
      return copy.sort((a, b) => expiredKey(a, b) || (b.interestedCount ?? 0) - (a.interestedCount ?? 0))
    case 'oldest':
      return copy.sort((a, b) => expiredKey(a, b) || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    case 'newest':
    default:
      return copy.sort((a, b) => expiredKey(a, b) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
}

export function filterProposalsBySearch(proposals: ActivityWithCount[], query: string): ActivityWithCount[] {
  const q = query.trim().toLowerCase()
  if (!q) return proposals
  return proposals.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      (p.location ?? '').toLowerCase().includes(q),
  )
}
