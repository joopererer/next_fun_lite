import { runHandler } from '@/lib/apiRoute'
import { handleGetActivitiesByIds } from '@/server/handlers'

export async function GET(request: Request) {
  return runHandler(request, handleGetActivitiesByIds)
}
