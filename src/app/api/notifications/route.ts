import { runHandler } from '@/lib/apiRoute'
import { handleGetNotifications } from '@/server/handlers/notifications'

export async function GET(request: Request) {
  return runHandler(request, handleGetNotifications)
}
