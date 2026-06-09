import { revalidateTag } from 'next/cache'

export function revalidateActivitiesCache(): void {
  revalidateTag('activities')
}
