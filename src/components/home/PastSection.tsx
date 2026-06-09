import { getCachedPastActivities } from '@/lib/cached-data'
import { PastSectionClient } from './PastSectionClient'

export async function PastSection() {
  const activities = await getCachedPastActivities()
  return <PastSectionClient activities={activities} />
}
