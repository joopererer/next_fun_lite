import { runHandler } from '@/lib/apiRoute'
import {
  handleGetNotifications,
  handleMarkAllNotificationsRead,
} from '@/server/handlers/notifications'

export async function GET(request: Request) {
  return runHandler(request, handleGetNotifications)
}

export async function PATCH(request: Request) {
  return runHandler(request, handleMarkAllNotificationsRead)
}
