import { runHandler } from '@/lib/apiRoute'
import { handleMarkAllNotificationsRead } from '@/server/handlers/notifications'

export async function POST(request: Request) {
  return runHandler(request, handleMarkAllNotificationsRead)
}
