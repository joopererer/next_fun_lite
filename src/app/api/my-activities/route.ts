import { runHandler } from '@/lib/apiRoute'
import { handleGetMyActivities } from '@/server/handlers'

export async function GET(request: Request) {
  return runHandler(request, handleGetMyActivities)
}
