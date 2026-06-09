import { notFound } from 'next/navigation'
import { getCachedActivityById, getCachedEnrichedActivities } from '@/lib/cached-data'
import { EventPage } from '@/src/views/EventPage'

export const revalidate = 30
export const dynamicParams = true

export async function generateStaticParams() {
  const activities = await getCachedEnrichedActivities()
  return activities
    .filter((a) => a.status === 'recruiting')
    .map((a) => ({ id: a.id }))
}

type Params = { params: Promise<{ id: string }> }

export default async function Page({ params }: Params) {
  const { id } = await params
  const activity = await getCachedActivityById(id)
  if (!activity) notFound()
  return <EventPage initialActivity={activity} />
}
