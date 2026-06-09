import { getCachedProposedActivities } from '@/lib/cached-data'
import { ProposalsSectionClient } from './ProposalsSectionClient'

export async function ProposalsSection() {
  const { proposedAll } = await getCachedProposedActivities()
  return <ProposalsSectionClient proposedAll={proposedAll} />
}
