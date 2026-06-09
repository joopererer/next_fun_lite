import { getCachedRecruitingActivities } from '@/lib/cached-data'
import { RecruitingSectionClient } from './RecruitingSectionClient'

export async function RecruitingSection() {
  const activities = await getCachedRecruitingActivities()
  return <RecruitingSectionClient activities={activities} />
}
