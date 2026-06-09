import { runHandler } from '@/lib/apiRoute'
import { handleGetUnreadCount } from '@/server/handlers/notifications'

export async function GET(request: Request) {
  return runHandler(request, handleGetUnreadCount)
}
